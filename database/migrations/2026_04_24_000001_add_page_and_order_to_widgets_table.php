<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPageAndOrderToWidgetsTable extends Migration
{
    public function up()
    {
        Schema::table('widgets', function (Blueprint $table) {
            $table->string('page')->default('home')->after('slug');
            $table->unsignedSmallInteger('display_order')->default(0)->after('page');
        });
    }

    public function down()
    {
        Schema::table('widgets', function (Blueprint $table) {
            $table->dropColumn(['page', 'display_order']);
        });
    }
}
