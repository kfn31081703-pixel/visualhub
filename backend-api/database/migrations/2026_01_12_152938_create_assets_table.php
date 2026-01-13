<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->constrained()->onDelete('cascade');
            $table->string('type', 50);
            $table->string('path', 500);
            $table->bigInteger('file_size')->nullable();
            $table->json('meta_json')->nullable();
            $table->timestamps();
            
            $table->index('type');
            $table->index(['episode_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
