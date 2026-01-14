<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('genre', 100);
            $table->string('target_country', 10)->default('KR');
            $table->string('tone', 50)->default('serious');
            $table->string('target_audience', 50)->default('teen');
            $table->text('keywords')->nullable();
            $table->text('world_setting')->nullable();
            $table->string('status', 50)->default('active');
            $table->timestamps();
            
            $table->index('genre');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
