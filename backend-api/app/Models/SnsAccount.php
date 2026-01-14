<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class SnsAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'account_name',
        'account_id',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'is_active',
        'settings'
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
        'token_expires_at' => 'datetime',
    ];

    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    /**
     * Set encrypted access token
     */
    public function setAccessTokenAttribute($value)
    {
        if ($value) {
            $this->attributes['access_token'] = Crypt::encryptString($value);
        }
    }

    /**
     * Get decrypted access token
     */
    public function getAccessTokenAttribute($value)
    {
        if ($value) {
            return Crypt::decryptString($value);
        }
        return null;
    }

    /**
     * Set encrypted refresh token
     */
    public function setRefreshTokenAttribute($value)
    {
        if ($value) {
            $this->attributes['refresh_token'] = Crypt::encryptString($value);
        }
    }

    /**
     * Get decrypted refresh token
     */
    public function getRefreshTokenAttribute($value)
    {
        if ($value) {
            return Crypt::decryptString($value);
        }
        return null;
    }

    /**
     * Check if token is expired
     */
    public function isTokenExpired()
    {
        if (!$this->token_expires_at) {
            return false;
        }
        return $this->token_expires_at->isPast();
    }

    /**
     * Scope: Get active accounts
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Get by platform
     */
    public function scopeByPlatform($query, $platform)
    {
        return $query->where('platform', $platform);
    }
}
