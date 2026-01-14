<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'genre',
        'target_country',
        'tone',
        'target_audience',
        'keywords',
        'world_setting',
        'status'
    ];

    protected $casts = [
        'keywords' => 'array',
    ];

    public function episodes()
    {
        return $this->hasMany(Episode::class);
    }

    public function characters()
    {
        return $this->hasMany(Character::class);
    }
}
