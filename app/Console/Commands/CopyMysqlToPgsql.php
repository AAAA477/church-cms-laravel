<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * One-shot data migration from the mysql connection to the pgsql one.
 *
 * Run AFTER `php artisan migrate --database=pgsql` has created the schema.
 * Postgres is strict where MySQL is forgiving, so values are coerced per
 * column type (0/1 -> boolean, '' -> NULL for non-text columns, zero-dates
 * -> NULL). Requires a superuser pgsql connection locally (uses
 * session_replication_role to skip FK ordering); for a managed host,
 * copy locally first and push with pg_dump/pg_restore instead.
 */
class CopyMysqlToPgsql extends Command
{
    protected $signature = 'db:copy-mysql-to-pgsql {--truncate : Empty each Postgres table before copying}';

    protected $description = 'Copy all data from the mysql connection into the pgsql connection';

    public function handle()
    {
        $mysql = DB::connection('mysql');
        $pgsql = DB::connection('pgsql');

        $tables = array_map(
            fn ($row) => array_values((array) $row)[0],
            $mysql->select('SHOW TABLES')
        );
        // Postgres has its own migrations bookkeeping.
        $tables = array_values(array_diff($tables, ['migrations']));

        $pgsql->statement('SET session_replication_role = replica');

        // Truncate everything BEFORE copying anything: TRUNCATE ... CASCADE
        // on a parent table would otherwise wipe child tables that were
        // already copied.
        if ($this->option('truncate')) {
            foreach ($tables as $table) {
                if ($pgsql->getSchemaBuilder()->hasTable($table)) {
                    $pgsql->statement("TRUNCATE TABLE \"{$table}\" CASCADE");
                }
            }
        }

        foreach ($tables as $table) {
            if (! $pgsql->getSchemaBuilder()->hasTable($table)) {
                $this->warn("skip {$table}: not in pgsql schema");
                continue;
            }

            $types = collect($pgsql->select(
                'SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = ? AND table_name = ?',
                ['public', $table]
            ))->pluck('data_type', 'column_name');

            $orderBy = $mysql->getSchemaBuilder()->hasColumn($table, 'id')
                ? 'id'
                : $mysql->getSchemaBuilder()->getColumnListing($table)[0];

            $copied = 0;
            $mysql->table($table)->orderBy($orderBy)->chunk(500, function ($rows) use ($pgsql, $table, $types, &$copied) {
                $batch = [];
                foreach ($rows as $row) {
                    $data = [];
                    foreach ((array) $row as $col => $value) {
                        $data[$col] = $this->coerce($value, $types[$col] ?? 'text');
                    }
                    $batch[] = $data;
                }
                $pgsql->table($table)->insert($batch);
                $copied += count($batch);
            });

            // Realign the id sequence with the copied data.
            $seq = $types->has('id')
                ? $pgsql->selectOne('SELECT pg_get_serial_sequence(?, ?) AS seq', [$table, 'id'])
                : null;
            if ($seq && $seq->seq) {
                $pgsql->statement("SELECT setval('{$seq->seq}', GREATEST((SELECT COALESCE(MAX(id), 0) FROM \"{$table}\"), 1))");
            }

            $this->info(str_pad($table, 36) . $copied . ' rows');
        }

        $pgsql->statement('SET session_replication_role = DEFAULT');
        $this->info('Done.');

        return self::SUCCESS;
    }

    private function coerce($value, string $pgType)
    {
        if ($value === null) {
            return null;
        }

        if ($pgType === 'boolean') {
            return (bool) $value;
        }

        // MySQL happily stores '' and zero-dates in typed columns; PG won't.
        if ($value === '' && ! in_array($pgType, ['text', 'character varying', 'character', 'json', 'jsonb'])) {
            return null;
        }

        if (is_string($value) && str_starts_with($value, '0000-00-00')
            && in_array($pgType, ['date', 'timestamp without time zone', 'timestamp with time zone'])) {
            return null;
        }

        return $value;
    }
}
