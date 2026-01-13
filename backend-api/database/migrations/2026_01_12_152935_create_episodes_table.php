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
        Schema::create('episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->integer('episode_number');
            $table->string('title')->nullable();
            $table->longText('script_text')->nullable();
            $table->json('storyboard_json')->nullable();
            $table->string('status', 50)->default('draft');
            $table->json('generation_metadata')->nullable();
            $table->timestamps();
            
            $table->unique(['project_id', 'episode_number']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
