<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\DepartmentController;
use App\Models\Category;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public helper lists for frontend forms
Route::get('/departments', [DepartmentController::class, 'index']);
Route::get('/categories', function() {
    return response()->json(Category::all());
});

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Documents CRUD & Workflow
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{id}', [DocumentController::class, 'show']);
    Route::put('/documents/{id}', [DocumentController::class, 'update']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);

    // Departments CRUD (admin only, enforced in controller)
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::get('/departments/{department}', [DepartmentController::class, 'show']);
    Route::put('/departments/{department}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);

    // Students CRUD
    Route::apiResource('students', StudentController::class);

    // Status workflow change (Admin/Staff with permission)
    Route::patch('/documents/{id}/status', [DocumentController::class, 'updateStatus']);

    // Dashboard analytics
    Route::get('/dashboard', [DocumentController::class, 'dashboard']);
});