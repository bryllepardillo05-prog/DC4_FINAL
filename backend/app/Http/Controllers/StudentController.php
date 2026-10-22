<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['department']);

        // Filter by department
        if ($request->has('department_id')) {
            $query->where('department_id', $request->input('department_id'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Search by name or student_id_number
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('student_id_number', 'like', "%{$search}%");
            });
        }

        // Pagination (default 10 items per page)
        $students = $query->latest()->paginate(10);

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'student_id_number' => 'nullable|string|max:255|unique:students,student_id_number',
            'year_level' => 'required|string|max:255',
            'status' => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $student = Student::create($request->only([
            'name',
            'student_id_number',
            'year_level',
            'status',
            'department_id',
        ]));

        return response()->json([
            'message' => 'Student created successfully',
            'student' => $student->load('department'),
        ], 201);
    }

    public function show(Student $student)
    {
        return response()->json($student->load(['department', 'documents']));
    }

    public function update(Request $request, Student $student)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'student_id_number' => 'nullable|string|max:255|unique:students,student_id_number,' . $student->id,
            'year_level' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $student->update($request->only([
            'name',
            'student_id_number',
            'year_level',
            'status',
            'department_id',
        ]));

        return response()->json([
            'message' => 'Student updated successfully',
            'student' => $student->load('department'),
        ]);
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json(['message' => 'Student deleted successfully'], 204);
    }
}
