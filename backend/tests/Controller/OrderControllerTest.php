<?php

namespace Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class OrderControllerTest extends WebTestCase
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
        $this->client->request('POST', '/api/orders', [], [], [], json_encode([
            'items' => [['productId' => 1, 'quantity' => 2]],
        ]));
        $this->assertEquals(401, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_order_with_empty_items(): void
    {
        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(), json_encode([
            'items' => [],
        ]));
        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_order_with_invalid_product(): void
    {
        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(), json_encode([
            'items' => [['productId' => 99999, 'quantity' => 1]],
        ]));
        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    public function test_order_creation_and_detail(): void
    {
        $productId = $this->createProduct();

        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(1, 'CLIENT'), json_encode([
            'items' => [['productId' => $productId, 'quantity' => 2]],
        ]));
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $orderId = $data['id'];

        $this->assertEquals('pending', $data['status']);
        $this->assertEquals(100.0, $data['total']);

        $this->client->request('GET', '/api/orders/'.$orderId, [], [], $this->authHeaders(1, 'CLIENT'));
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function test_order_belongs_to_customer(): void
    {
        $productId = $this->createProduct();

        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(1, 'CLIENT'), json_encode([
            'items' => [['productId' => $productId, 'quantity' => 1]],
        ]));
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $orderId = $data['id'];

        $this->client->request('GET', '/api/orders/'.$orderId, [], [], $this->authHeaders(2, 'CLIENT'));
        $this->assertEquals(403, $this->client->getResponse()->getStatusCode());
    }

    public function test_checkout_pending_order(): void
    {
        $productId = $this->createProduct();

        $this->client->request('POST', '/api/orders', [], [], $this->authHeaders(1, 'CLIENT'), json_encode([
            'items' => [['productId' => $productId, 'quantity' => 1]],
        ]));
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $orderId = $data['id'];

        $this->client->request('POST', '/api/orders/'.$orderId.'/checkout', [], [], $this->authHeaders(1, 'CLIENT'));
        $statusCode = $this->client->getResponse()->getStatusCode();
        $this->assertContains($statusCode, [200, 402]);
    }
}
