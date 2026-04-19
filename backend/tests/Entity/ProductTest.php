<?php

namespace Tests\Entity;

use App\Entity\Product;
use PHPUnit\Framework\TestCase;

class ProductTest extends TestCase
{
    public function test_product_creation(): void
    {
        // Arrange
        $product = new Product;

        // Act
        $product->setName('Laptop');
        $product->setDescription('A good laptop');
        $product->setPrice(999.99);
        $product->setStock(50);
        $product->setCategory('Electronics');

        // Assert
        $this->assertEquals('Laptop', $product->getName());
        $this->assertEquals('A good laptop', $product->getDescription());
        $this->assertEquals(999.99, $product->getPrice());
        $this->assertEquals(50, $product->getStock());
        $this->assertEquals('Electronics', $product->getCategory());
        $this->assertNotNull($product->getCreatedAt());
    }
}
