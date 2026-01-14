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
        Schema::create('sns_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->constrained()->onDelete('cascade');
            $table->string('platform'); // twitter, facebook, instagram
            $table->text('content'); // Post content/caption
            $table->string('image_url')->nullable(); // Episode thumbnail or custom image
            $table->string('post_url')->nullable(); // URL after posting
            $table->string('post_id')->nullable(); // Platform-specific post ID
            $table->enum('status', ['draft', 'scheduled', 'posted', 'failed'])->default('draft');
            $table->timestamp('scheduled_at')->nullable(); // When to post
            $table->timestamp('posted_at')->nullable(); // When it was actually posted
            $table->json('metadata')->nullable(); // Platform-specific data (hashtags, mentions, etc.)
            $table->text('error_message')->nullable(); // Error details if failed
            $table->timestamps();
            
            // Indexes
            $table->index(['episode_id', 'platform']);
            $table->index('status');
            $table->index('scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sns_posts');
    }
};
