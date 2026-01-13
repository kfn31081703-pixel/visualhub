<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prompts', function (Blueprint $table) {
            $table->id();
            $table->string('engine_type', 100);
            $table->string('version', 50);
            $table->text('prompt_template');
            $table->json('parameters')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['engine_type', 'version']);
            $table->index(['engine_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prompts');
    }
};
