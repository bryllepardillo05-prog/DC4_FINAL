<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use App\Models\Category;
use App\Models\Document;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
       
        $dept1 = Department::create(['name' => 'College of Arts Sciences and Technology', 'code' => 'CAST', 'description' => 'IT and Computer Science department']);
        $dept2 = Department::create(['name' => 'Office of the Registrar', 'code' => 'REG', 'description' => 'Student records and admissions']);

     
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@edu.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'department_id' => $dept1->id,
        ]);

        User::create([
            'name' => 'Brylle Faculty',
            'email' => 'staff@edu.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
            'department_id' => $dept1->id,
        ]);

        // 3. Create Categories
        $cat1 = Category::create(['name' => 'Lesson Plan', 'description' => 'Course syllabi and daily lesson plans']);
        $cat2 = Category::create(['name' => 'Memorandum', 'description' => 'Official school memos and directives']);

        // 4. Create Sample Documents
        Document::create([
            'user_id' => 2,
            'category_id' => $cat1->id,
            'department_id' => $dept1->id,
            'title' => 'BSIT 1st Semester 2026',
            'document_number' => 'DOC-CCS-2026-001',
            'file_path' => 'documents/sample_syllabus.pdf',
            'status' => 'Pending Review',
            'remarks' => 'Submitted for review',
            'date_submitted' => now(),
        ]);
    }
}