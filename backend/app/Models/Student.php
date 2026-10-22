<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'student_id_number',
        'year_level',
        'status',
        'department_id',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
