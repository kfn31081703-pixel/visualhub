#!/bin/bash

# TOONVERSE AI - Complete Migration Setup Script
# This script will create all database migrations at once

cd /var/www/toonverse/webapp/backend-api

echo "================================================"
echo "TOONVERSE AI - Database Migration Setup"
echo "================================================"
echo ""

# Create jobs table migration content
cat > database/migrations/2026_01_12_152935_create_jobs_table.php << 'EOF'
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
EOF

# Create assets table migration
cat > database/migrations/2026_01_12_152935_create_assets_table.php << 'EOF'
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
EOF

# Create characters table migration
cat > database/migrations/2026_01_12_152936_create_characters_table.php << 'EOF'
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
EOF

# Create prompts table migration
cat > database/migrations/2026_01_12_152936_create_prompts_table.php << 'EOF'
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
EOF

# Create channels table migration
cat > database/migrations/2026_01_12_152936_create_channels_table.php << 'EOF'
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
EOF

# Create publish_tasks table migration
cat > database/migrations/2026_01_12_152937_create_publish_tasks_table.php << 'EOF'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publish_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->constrained()->onDelete('cascade');
            $table->foreignId('channel_id')->constrained()->onDelete('cascade');
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');
            $table->timestamp('scheduled_at');
            $table->timestamp('published_at')->nullable();
            $table->string('status', 50)->default('scheduled');
            $table->string('post_url', 500)->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publish_tasks');
    }
};
EOF

# Create metrics table migration
cat > database/migrations/2026_01_12_152937_create_metrics_table.php << 'EOF'
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
EOF

echo "✅ All migration files created successfully!"
echo ""
echo "Running migrations..."
php artisan migrate --force

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Checking tables..."
mysql -u root -p'hj986600*' -D toonverse -e "SHOW TABLES;"

echo ""
echo "================================================"
echo "✅ Migration setup completed successfully!"
echo "================================================"
