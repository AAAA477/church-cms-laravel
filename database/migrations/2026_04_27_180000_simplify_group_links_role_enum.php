<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class SimplifyGroupLinksRoleEnum extends Migration
{
    public function up()
    {
        // Step 1: expand enum to include new values alongside old ones
        DB::statement("ALTER TABLE group_links MODIFY COLUMN role ENUM('leader','president','secretary','treasurer','member','group_admin','guest') NULL");
        // Step 2: migrate data
        DB::statement("UPDATE group_links SET role = 'group_admin' WHERE role IN ('leader','president')");
        DB::statement("UPDATE group_links SET role = 'member' WHERE role IN ('secretary','treasurer')");
        // Step 3: narrow enum to only the new values
        DB::statement("ALTER TABLE group_links MODIFY COLUMN role ENUM('group_admin','member','guest') NULL");
    }

    public function down()
    {
        DB::statement("ALTER TABLE group_links MODIFY COLUMN role ENUM('leader','president','secretary','treasurer','member','group_admin','guest') NULL");
        DB::statement("UPDATE group_links SET role = 'leader' WHERE role = 'group_admin'");
        DB::statement("UPDATE group_links SET role = 'member' WHERE role = 'guest'");
        DB::statement("ALTER TABLE group_links MODIFY COLUMN role ENUM('leader','president','secretary','treasurer','member') NULL");
    }
}
