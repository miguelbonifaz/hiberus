<?php

namespace Tests\Entity;

use App\Entity\OrderItem;
use PHPUnit\Framework\TestCase;

class OrderItemTest extends TestCase
{
    public function test_order_item_subtotal(): void
    {
        // Arrange
        $item = new OrderItem;
        $item->setUnitPrice(29.99);
        $item->setQuantity(3);

        // Act
        $subtotal = $item->getSubtotal();

        // Assert
        $this->assertEquals(89.97, $subtotal);
    }
}
