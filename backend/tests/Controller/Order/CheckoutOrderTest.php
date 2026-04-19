<?php

namespace Tests\Controller\Order;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CheckoutOrderTest extends WebTestCase
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

    public function test_checkout_pending_order(): void
    {
        // Arrange
        $productId = $this->createProduct();

        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(1, 'CLIENT'), json_encode([
            'items' => [['productId' => $productId, 'quantity' => 1]],
        ]));
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $orderId = $data['id'];

        // Act
        $this->client->request('POST', '/api/orders/'.$orderId.'/checkout', [], [], $this->authHeaders(1, 'CLIENT'));

        // Assert - randomized outcome: 80% success, 20% fail
        $statusCode = $this->client->getResponse()->getStatusCode();
        $this->assertContains($statusCode, [200, 402]);
    }
}
