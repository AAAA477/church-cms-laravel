<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Preferred contact channel collected at registration (email / phone /
 * sms / whatsapp) so staff know how someone wants to be reached.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('userprofiles', function (Blueprint $table) {
            $table->string('preferred_channel', 20)->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('userprofiles', function (Blueprint $table) {
            $table->dropColumn('preferred_channel');
        });
    }
};
