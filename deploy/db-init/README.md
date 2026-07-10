# One-time database seed

Any `*.sql` / `*.sql.gz` file placed in this directory is executed by the
Postgres container **only on its very first start** (empty `dbdata` volume).
Put your `pg_dump --no-owner` of the dev database here before the first
`docker compose up` to migrate your data. Dumps are gitignored.

To re-run the import from scratch: `docker compose down -v` (destroys ALL
volumes, including uploaded media) or `docker volume rm <project>_dbdata`.
