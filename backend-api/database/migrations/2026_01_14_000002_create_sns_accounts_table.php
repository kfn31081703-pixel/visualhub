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
        Schema::create('sns_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('platform'); // twitter, facebook, instagram
            $table->string('account_name'); // Display name
            $table->string('account_id')->nullable(); // Platform-specific account ID
            $table->text('access_token')->nullable(); // Encrypted access token
            $table->text('refresh_token')->nullable(); // Encrypted refresh token
            $table->timestamp('token_expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable(); // Platform-specific settings
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['platform', 'account_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sns_accounts');
    }
};
