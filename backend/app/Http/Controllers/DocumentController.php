<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentLog;
use App\Http\Requests\StoreDocumentRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with(['user', 'category', 'department', 'student']);

        // Search by title or document number
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Filter by department
        if ($request->has('department_id')) {
            $query->where('department_id', $request->input('department_id'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->input('student_id'));
        }

        // Pagination (default 10 items per page)
        $documents = $query->latest()->paginate(10);

        return response()->json($documents);
    }

    public function store(StoreDocumentRequest $request)
    {
        $file = $request->file('file');
        $filePath = $file->store('documents', 'public');

        $document = Document::create([
            'user_id' => $request->user()->id,
            'category_id' => $request->category_id,
            'department_id' => $request->department_id,
            'title' => $request->title,
            'document_number' => $request->document_number,
            'file_path' => $filePath,
            'status' => 'Pending Review',
            'remarks' => $request->remarks,
            'date_submitted' => now(),
            'student_id' => $request->student_id,
        ]);

        // Log action
        DocumentLog::create([
            'document_id' => $document->id,
            'action_by' => $request->user()->id,
            'status_action' => 'Pending Review',
            'remarks' => 'Document uploaded and submitted.',
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document->load(['user', 'category', 'department', 'student'])
        ], 201);
    }

    public function show($id)
    {
        $document = Document::with(['user', 'category', 'department', 'student', 'logs.actor'])->findOrFail($id);
        return response()->json($document);
    }

    public function update(Request $request, $id)
    {
        $document = Document::findOrFail($id);
        abort_unless($request->user()->role === 'admin' || $request->user()->id === $document->user_id, 403);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'department_id' => 'sometimes|exists:departments,id',
            'remarks' => 'nullable|string',
            'file' => 'sometimes|file|mimes:pdf,docx,xlsx|max:10240',
        ]);

        $document->update($request->only(['title', 'category_id', 'department_id', 'remarks']));

        if ($request->hasFile('file')) {
            $document->file_path = $request->file('file')->store('documents', 'public');
            $document->save();
        }

        return response()->json([
            'message' => 'Document updated successfully',
            'document' => $document->load(['user', 'category', 'department', 'student'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $document = Document::findOrFail($id);

        // Check if admin or owner
        if ($request->user()->role !== 'admin' && $request->user()->id !== $document->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $document->delete();

        return response()->json(['message' => 'Document deleted successfully'], 204);
    }

    // Status Workflow Update (Admin only usually)
    public function updateStatus(Request $request, $id)
    {
        abort_unless($request->user()->role === 'admin', 403);

        $request->validate([
            'status' => 'required|string|in:Pending Review,Under Review,Approved,Needs Revision,Archived',
            'remarks' => 'nullable|string',
        ]);

        $document = Document::findOrFail($id);
        $document->status = $request->status;
        $document->remarks = $request->remarks;
        $document->save();

        // Create log
        DocumentLog::create([
            'document_id' => $document->id,
            'action_by' => $request->user()->id,
            'status_action' => $request->status,
            'remarks' => $request->remarks,
        ]);

        return response()->json([
            'message' => 'Document status updated successfully',
            'document' => $document->load(['user', 'category', 'department', 'logs.actor'])
        ]);
    }

    // Dashboard Summary Counts
    public function dashboard(Request $request)
    {
        return response()->json([
            'total_documents' => Document::count(),
            'pending_approvals' => Document::where('status', 'Pending Review')->count(),
            'approved_papers' => Document::where('status', 'Approved')->count(),
            'archived_items' => Document::where('status', 'Archived')->count(),
            'recent_uploads' => Document::with(['user', 'category', 'department'])->latest()->take(5)->get(),
        ]);
    }
}