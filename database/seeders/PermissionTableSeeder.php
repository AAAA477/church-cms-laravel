<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
      //
      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-members',
        'display_name'  => 'Create Members',
        'description'   => 'Create Members', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-members',
        'display_name'  => 'Read Members',
        'description'   => 'Read Members', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-members',
        'display_name'  => 'Update Members',
        'description'   => 'Update Members', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-events',
        'display_name'  => 'Create Events',
        'description'   => 'Create Events', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-events',
        'display_name'  => 'Read Events',
        'description'   => 'Read Events', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-events',
        'display_name'  => 'Update Events',
        'description'   => 'Update Events', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-files',
        'display_name'  => 'Create Files',
        'description'   => 'Create Files', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-files',
        'display_name'  => 'Read Files',
        'description'   => 'Read Files', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'view-files',
        'display_name'  => 'View Files',
        'description'   => 'View Files', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-bulletins',
        'display_name'  => 'Create Bulletins',
        'description'   => 'Create Bulletins', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-bulletins',
        'display_name'  => 'Read Bulletins',
        'description'   => 'Read Bulletins', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'view-bulletins',
        'display_name'  => 'view-bulletins',
        'description'   => 'view-bulletins', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-gallery',
        'display_name'  => 'Create Gallery',
        'description'   => 'Create Gallery', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-gallery',
        'display_name'  => 'Read Gallery',
        'description'   => 'Read Gallery', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-gallery',
        'display_name'  => 'Update Gallery',
        'description'   => 'Update Gallery', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-groups',
        'display_name'  => 'Create Groups',
        'description'   => 'Create Groups', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-groups',
        'display_name'  => 'Read Groups',
        'description'   => 'Read Groups', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-groups',
        'display_name'  => 'Update Groups',
        'description'   => 'Update Groups', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'delete-groups',
        'display_name'  => 'Delete Groups',
        'description'   => 'Delete Groups', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-videos',
        'display_name'  => 'Create Videos',
        'description'   => 'Create Videos', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-videos',
        'display_name'  => 'Read Videos',
        'description'   => 'Read Videos', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'view-videos',
        'display_name'  => 'View Videos',
        'description'   => 'View Videos', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-funds',
        'display_name'  => 'Create Funds',
        'description'   => 'Create Funds', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-funds',
        'display_name'  => 'Read Funds',
        'description'   => 'Read Funds', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-funds',
        'display_name'  => 'Update Funds',
        'description'   => 'Update Funds', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'view-funds',
        'display_name'  => 'View Funds',
        'description'   => 'View Funds', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-quotes',
        'display_name'  => 'Create Quotes',
        'description'   => 'Create Quotes', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-quotes',
        'display_name'  => 'Read Quotes',
        'description'   => 'Read Quotes', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-quotes',
        'display_name'  => 'Update Quotes',
        'description'   => 'Update Quotes', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-preachers',
        'display_name'  => 'Create Preachers',
        'description'   => 'Create Preachers', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-preachers',
        'display_name'  => 'Read Preachers',
        'description'   => 'Read Preachers', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-preachers',
        'display_name'  => 'Update Preachers',
        'description'   => 'Update Preachers', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-reports',
        'display_name'  => 'Read Reports',
        'description'   => 'Read Reports', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'view-reports',
        'display_name'  => 'View Reports',
        'description'   => 'View Reports', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-payments',
        'display_name'  => 'Read Payments',
        'description'   => 'Read Payments', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-payments',
        'display_name'  => 'Create Payments',
        'description'   => 'Create Payments', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'create-sermons',
        'display_name'  => 'Create Sermons',
        'description'   => 'Create Sermons', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-sermons',
        'display_name'  => 'Read Sermons',
        'description'   => 'Read Sermons', 
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-sermons',
        'display_name'  => 'Update Sermons',
        'description'   => 'Update Sermons', 
      ]);


      DB::table('permissions')->insertOrIgnore([
        'name'          => 'delete-sermons',
        'display_name'  => 'Delete Sermons',
        'description'   => 'Delete Sermons',
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-prayers',
        'display_name'  => 'Read Prayers',
        'description'   => 'View prayer board',
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-prayers',
        'display_name'  => 'Update Prayers',
        'description'   => 'Moderate prayers (approve, reject, pin, mark answered, etc.)',
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-helps',
        'display_name'  => 'Read Help Requests',
        'description'   => 'View help requests list and details',
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-helps',
        'display_name'  => 'Update Help Requests',
        'description'   => 'Respond to and update help requests',
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-contacts',
        'display_name'  => 'Read Contacts',
        'description'   => 'View contact form submissions',
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'read-feedbacks',
        'display_name'  => 'Read Feedbacks',
        'description'   => 'View feedback submissions',
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'update-feedbacks',
        'display_name'  => 'Update Feedbacks',
        'description'   => 'Update feedback status',
      ]);


      DB::table('permissions')->insertOrIgnore([
        'name'          => 'manage-email-blaster',
        'display_name'  => 'Manage Email Blaster',
        'description'   => 'Full access to campaigns, emails, mailing lists, subscribers, SMTP, queues, rules, and webhooks',
      ]);

      DB::table('permissions')->insertOrIgnore([
        'name'          => 'manage-cms',
        'display_name'  => 'Manage CMS',
        'description'   => 'Full access to pages, posts, FAQ, code snippets, and Google Analytics',
      ]);
  }
}