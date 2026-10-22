<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_log_in_and_receive_a_token_and_user(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'admin@example.com')
            ->assertJsonStructure(['access_token', 'token_type', 'user']);
    }

    public function test_login_rejects_incorrect_credentials(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'incorrect-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }
}
