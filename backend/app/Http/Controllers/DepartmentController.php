<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function index()
    {
        return response()->json(Department::latest()->get());
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->role === 'admin', 403);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code',
            'description' => 'nullable|string',
        ]);

        $department = Department::create($request->only(['name', 'code', 'description']));

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department,
        ], 201);
    }

    public function show(Department $department)
    {
        return response()->json($department);
    }

    public function update(Request $request, Department $department)
    {
        abort_unless($request->user()->role === 'admin', 403);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('departments', 'code')->ignore($department->id)],
            'description' => 'nullable|string',
        ]);

        $department->update($request->only(['name', 'code', 'description']));

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $department,
        ]);
    }

    public function destroy(Request $request, Department $department)
    {
        abort_unless($request->user()->role === 'admin', 403);

        $department->delete();

        return response()->json(['message' => 'Department deleted successfully'], 204);
    }
}
