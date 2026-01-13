<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('type', 100);
            $table->string('status', 50)->default('queued');
            $table->json('input_json')->nullable();
            $table->json('output_json')->nullable();
            $table->text('error_message')->nullable();
            $table->decimal('cost_units', 10, 2)->default(0.00);
            $table->integer('retry_count')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
