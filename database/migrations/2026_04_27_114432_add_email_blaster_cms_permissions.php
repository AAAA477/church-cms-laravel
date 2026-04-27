<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['name' => 'manage-email-blaster', 'display_name' => 'Manage Email Blaster', 'description' => 'Full access to campaigns, emails, mailing lists, subscribers, SMTP, queues, rules, and webhooks'],
            ['name' => 'manage-cms',           'display_name' => 'Manage CMS',           'description' => 'Full access to pages, posts, FAQ, code snippets, and Google Analytics'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->insertOrIgnore($permission);
        }
    }

    public function down(): void
    {
        DB::table('permissions')->whereIn('name', ['manage-email-blaster', 'manage-cms'])->delete();
    }
};
