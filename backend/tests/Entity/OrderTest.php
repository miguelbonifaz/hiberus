<?php

namespace Tests\Entity;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use PHPUnit\Framework\TestCase;

class OrderTest extends TestCase
{
    public function test_order_defaults(): void
    {
        // Arrange
        $order = new Order;

        // Act
        // No action needed - checking defaults

        // Assert
        $this->assertEquals('pending', $order->getStatus());
        $this->assertEquals(0, $order->getTotal());
        $this->assertNotNull($order->getCreatedAt());
    }

    public function test_recalculate_total(): void
    {
        // Arrange
        $product = new Product;
        $product->setName('Test');
        $product->setPrice(25.0);
        $product->setStock(10);
        $product->setCategory('Test');

        $item1 = new OrderItem;
        $item1->setProduct($product);
        $item1->setQuantity(2);
        $item1->setUnitPrice(25.0);

        $item2 = new OrderItem;
        $item2->setProduct($product);
        $item2->setQuantity(3);
        $item2->setUnitPrice(25.0);

        $order = new Order;
        $order->setCustomerId(1);
        $order->addItem($item1);
        $order->addItem($item2);

        // Act
        $order->recalculateTotal();

        // Assert
        $this->assertEquals(125.0, $order->getTotal());
    }

    public function test_order_status_transitions(): void
    {
        // Arrange
        $order = new Order;

        // Assert - initial status
        $this->assertEquals('pending', $order->getStatus());

        // Act
        $order->setStatus(Order::STATUS_PAID);

        // Assert
        $this->assertEquals('paid', $order->getStatus());

        // Act
        $order->setStatus(Order::STATUS_FAILED);

        // Assert
        $this->assertEquals('failed', $order->getStatus());
    }
}
