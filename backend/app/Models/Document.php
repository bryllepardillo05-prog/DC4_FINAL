<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'department_id',
        'title',
        'document_number',
        'file_path',
        'status',
        'remarks',
        'date_submitted',
        'student_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function logs()
    {
        return $this->hasMany(DocumentLog::class);
    }
}