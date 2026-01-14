<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->string('platform', 50);
            $table->string('channel_name');
            $table->string('country', 10)->nullable();
            $table->string('language', 10)->nullable();
            $table->text('api_token')->nullable();
            $table->json('api_config')->nullable();
            $table->string('status', 50)->default('active');
            $table->timestamp('last_published_at')->nullable();
            $table->timestamps();
            
            $table->unique(['platform', 'channel_name']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('channels');
    }
};
