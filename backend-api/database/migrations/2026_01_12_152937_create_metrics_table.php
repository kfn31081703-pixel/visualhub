<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('channel_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('metric_type', 50);
            $table->decimal('value', 15, 2);
            $table->timestamp('collected_at')->useCurrent();
            $table->timestamps();
            
            $table->index('metric_type');
            $table->index('collected_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metrics');
    }
};
