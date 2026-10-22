<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Department;
use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_authenticated_user_can_create_view_update_and_delete_a_document(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Reports']);
        $department = Department::create(['name' => 'Records', 'code' => 'REC']);

        $createResponse = $this->actingAs($user)->post('/api/documents', [
            'title' => 'Quarterly report',
            'document_number' => 'REP-2026-001',
            'category_id' => $category->id,
            'department_id' => $department->id,
            'remarks' => 'For review',
            'file' => UploadedFile::fake()->create('report.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json']);

        $createResponse->assertCreated();
        $documentId = $createResponse->json('document.id');

        $this->getJson("/api/documents/{$documentId}")
            ->assertOk()
            ->assertJsonPath('title', 'Quarterly report')
            ->assertJsonPath('status', 'Pending Review');

        $this->putJson("/api/documents/{$documentId}", [
            'title' => 'Updated quarterly report',
            'remarks' => 'Reviewed',
        ])->assertOk()
            ->assertJsonPath('document.title', 'Updated quarterly report');

        $this->deleteJson("/api/documents/{$documentId}")->assertNoContent();
        $this->assertDatabaseMissing('documents', ['id' => $documentId]);
    }

    public function test_a_user_cannot_edit_or_delete_another_users_document(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = Category::create(['name' => 'Reports']);
        $department = Department::create(['name' => 'Records', 'code' => 'REC']);
        $document = Document::create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'title' => 'Private report',
            'document_number' => 'REP-2026-002',
            'file_path' => 'documents/private.pdf',
            'status' => 'Pending Review',
        ]);

        $this->actingAs($otherUser)
            ->putJson("/api/documents/{$document->id}", ['title' => 'Tampered report'])
            ->assertForbidden();

        $this->deleteJson("/api/documents/{$document->id}")->assertForbidden();
        $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Private report']);
    }

    public function test_only_an_admin_can_change_document_status(): void
    {
        $owner = User::factory()->create();
        $category = Category::create(['name' => 'Reports']);
        $department = Department::create(['name' => 'Records', 'code' => 'REC']);
        $document = Document::create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'department_id' => $department->id,
            'title' => 'Status report',
            'document_number' => 'REP-2026-003',
            'file_path' => 'documents/status.pdf',
            'status' => 'Pending Review',
        ]);

        $this->actingAs($owner)
            ->patchJson("/api/documents/{$document->id}/status", ['status' => 'Approved'])
            ->assertForbidden();

        $this->assertDatabaseHas('documents', ['id' => $document->id, 'status' => 'Pending Review']);
    }
}
