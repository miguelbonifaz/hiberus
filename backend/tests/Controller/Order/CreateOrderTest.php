<?php

namespace Tests\Controller\Order;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CreateOrderTest extends WebTestCase
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

    private function createProduct(): int
    {
        $this->client->request('POST', '/api/products', [], [], [
            'HTTP_X_User_Id' => 1,
            'HTTP_X_User_Role' => 'ADMIN',
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'name' => 'Test Product for Order',
            'description' => 'Test',
            'price' => 50.0,
            'stock' => 100,
            'category' => 'Test',
        ]));

        return json_decode($this->client->getResponse()->getContent(), true)['id'];
    }

    public function test_create_order_without_auth(): void
    {
        // Arrange
        $payload = json_encode([
            'items' => [['productId' => 1, 'quantity' => 2]],
        ]);

        // Act
        $this->client->request('POST', '/api/orders', [], [], [], $payload);

        // Assert
        $this->assertEquals(401, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_order_with_empty_items(): void
    {
        // Arrange
        $payload = json_encode([
            'items' => [],
        ]);

        // Act
        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(), $payload);

        // Assert
        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_order_with_invalid_product(): void
    {
        // Arrange
        $payload = json_encode([
            'items' => [['productId' => 99999, 'quantity' => 1]],
        ]);

        // Act
        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(), $payload);

        // Assert
        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }
}
