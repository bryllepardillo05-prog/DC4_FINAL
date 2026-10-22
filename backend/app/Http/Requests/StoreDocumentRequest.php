<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'department_id' => 'required|exists:departments,id',
            'document_number' => 'required|string|unique:documents,document_number',
            'file' => 'required|file|mimes:pdf,docx,xlsx|max:10240', // Max 10MB
            'remarks' => 'nullable|string',
            'student_id' => 'nullable|exists:students,id',
        ];
    }
}