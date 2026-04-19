<?php

namespace Tests\Controller\Order;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ViewOrderTest extends WebTestCase
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

    public function test_order_creation_and_detail(): void
    {
        // Arrange
        $productId = $this->createProduct();

        // Act
        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(1, 'CLIENT'), json_encode([
            'items' => [['productId' => $productId, 'quantity' => 2]],
        ]));

        // Assert
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $orderId = $data['id'];
        $this->assertEquals('pending', $data['status']);
        $this->assertEquals(100.0, $data['total']);

        // Act - view order detail
        $this->client->request('GET', '/api/orders/'.$orderId, [], [], $this->authHeaders(1, 'CLIENT'));

        // Assert - order detail accessible
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function test_order_belongs_to_customer(): void
    {
        // Arrange
        $productId = $this->createProduct();

        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(1, 'CLIENT'), json_encode([
            'items' => [['productId' => $productId, 'quantity' => 1]],
        ]));
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $orderId = $data['id'];

        // Act - try to access another customer's order
        $this->client->request('GET', '/api/orders/'.$orderId, [], [], $this->authHeaders(2, 'CLIENT'));

        // Assert - forbidden
        $this->assertEquals(403, $this->client->getResponse()->getStatusCode());
    }
}
