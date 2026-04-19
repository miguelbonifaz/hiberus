<?php

namespace Tests\Controller\Product;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CreateProductTest extends WebTestCase
{
    private $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
    }

    private function authHeaders(int $userId = 1, string $role = 'CLIENT'): array
    {
        return [
            'HTTP_X_User_Id' => $userId,
            'HTTP_X_User_Role' => $role,
        ];
    }

    public function test_create_product_as_admin(): void
    {
        // Arrange
        $payload = json_encode([
            'name' => 'Test Product',
            'description' => 'Test description',
            'price' => 99.99,
            'stock' => 10,
            'category' => 'Test',
        ]);

        // Act
        $this->client->request('POST', '/api/products', [], [], $this->authHeaders(1, 'ADMIN'), $payload);

        // Assert
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_product_as_client_forbidden(): void
    {
        // Arrange
        $payload = json_encode([
            'name' => 'Test Product',
            'description' => 'Test',
            'price' => 99.99,
            'stock' => 10,
            'category' => 'Test',
        ]);

        // Act
        $this->client->request('POST', '/api/products', [], [], $this->authHeaders(2, 'CLIENT'), $payload);

        // Assert
        $this->assertEquals(403, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_product_without_auth(): void
    {
        // Arrange
        $payload = json_encode([
            'name' => 'Test Product',
            'description' => 'Test',
            'price' => 99.99,
            'stock' => 10,
            'category' => 'Test',
        ]);

        // Act
        $this->client->request('POST', '/api/products', [], [], [], $payload);

        // Assert
        $this->assertEquals(401, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_product_validation_fails(): void
    {
        // Arrange
        $payload = json_encode([
            'name' => '',
            'price' => -5,
            'stock' => -1,
            'category' => '',
        ]);

        // Act
        $this->client->request('POST', '/api/products', [], [], $this->authHeaders(1, 'ADMIN'), $payload);

        // Assert
        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $data);
    }
}
