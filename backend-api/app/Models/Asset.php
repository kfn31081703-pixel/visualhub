<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'episode_id',
        'type',
        'path',
        'file_size',
        'meta_json'
    ];

    protected $casts = [
        'meta_json' => 'array',
    ];

    public function episode()
    {
        return $this->belongsTo(Episode::class);
    }
}
