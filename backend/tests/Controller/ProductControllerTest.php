<?php

namespace Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ProductControllerTest extends WebTestCase
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

    public function test_list_products_without_auth(): void
    {
        $this->client->request('GET', '/api/products');
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_product_as_admin(): void
    {
        $this->client->request('POST', '/api/products', [], [], $this->authHeaders(1, 'ADMIN'), json_encode([
            'name' => 'Test Product',
            'description' => 'Test description',
            'price' => 99.99,
            'stock' => 10,
            'category' => 'Test',
        ]));
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_product_as_client_forbidden(): void
    {
        $this->client->request('POST', '/api/products', [], [], $this->authHeaders(2, 'CLIENT'), json_encode([
            'name' => 'Test Product',
            'description' => 'Test',
            'price' => 99.99,
            'stock' => 10,
            'category' => 'Test',
        ]));
        $this->assertEquals(403, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_product_without_auth(): void
    {
        $this->client->request('POST', '/api/products', [], [], [], json_encode([
            'name' => 'Test Product',
            'description' => 'Test',
            'price' => 99.99,
            'stock' => 10,
            'category' => 'Test',
        ]));
        $this->assertEquals(401, $this->client->getResponse()->getStatusCode());
    }

    public function test_create_product_validation_fails(): void
    {
        $this->client->request('POST', '/api/products', [], [], $this->authHeaders(1, 'ADMIN'), json_encode([
            'name' => '',
            'price' => -5,
            'stock' => -1,
            'category' => '',
        ]));
        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $data);
    }
}
