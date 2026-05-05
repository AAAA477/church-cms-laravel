<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAttendanceScopeToEventsTable extends Migration
{
    public function up()
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('attendance_scope')->default('all')->after('enable_attendance');
            $table->unsignedBigInteger('attendance_group_id')->nullable()->after('attendance_scope');
        });
    }

    public function down()
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['attendance_scope', 'attendance_group_id']);
        });
    }
}
