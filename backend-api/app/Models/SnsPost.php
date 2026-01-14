<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SnsPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'episode_id',
        'platform',
        'content',
        'image_url',
        'post_url',
        'post_id',
        'status',
        'scheduled_at',
        'posted_at',
        'metadata',
        'error_message'
    ];

    protected $casts = [
        'metadata' => 'array',
        'scheduled_at' => 'datetime',
        'posted_at' => 'datetime',
    ];

    /**
     * Get the episode that owns the SNS post.
     */
    public function episode()
    {
        return $this->belongsTo(Episode::class);
    }

    /**
     * Scope: Get posts by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Get scheduled posts that are ready to post
     */
    public function scopeReadyToPost($query)
    {
        return $query->where('status', 'scheduled')
                     ->where('scheduled_at', '<=', now());
    }

    /**
     * Scope: Get posts by platform
     */
    public function scopeByPlatform($query, $platform)
    {
        return $query->where('platform', $platform);
    }
}
