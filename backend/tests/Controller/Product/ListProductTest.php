<?php

namespace Tests\Controller\Product;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ListProductTest extends WebTestCase
{
    private $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
    }

    public function test_list_products_without_auth(): void
    {
        // Arrange
        // No auth required for listing products

        // Act
        $this->client->request('GET', '/api/products');

        // Assert
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }
}
