<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('characters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('reference_images')->nullable();
            $table->string('style_preset', 100)->nullable();
            $table->text('appearance')->nullable();
            $table->text('personality')->nullable();
            $table->timestamps();
            
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('characters');
    }
};
