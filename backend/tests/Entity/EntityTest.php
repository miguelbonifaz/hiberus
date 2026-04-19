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
        $order = new Order;
        $this->assertEquals('pending', $order->getStatus());
        $this->assertEquals(0, $order->getTotal());
        $this->assertNotNull($order->getCreatedAt());
    }

    public function test_recalculate_total(): void
    {
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
        $order->recalculateTotal();

        $this->assertEquals(125.0, $order->getTotal());
    }

    public function test_order_status_transitions(): void
    {
        $order = new Order;
        $this->assertEquals('pending', $order->getStatus());

        $order->setStatus(Order::STATUS_PAID);
        $this->assertEquals('paid', $order->getStatus());

        $order->setStatus(Order::STATUS_FAILED);
        $this->assertEquals('failed', $order->getStatus());
    }
}

class ProductTest extends TestCase
{
    public function test_product_creation(): void
    {
        $product = new Product;
        $product->setName('Laptop');
        $product->setDescription('A good laptop');
        $product->setPrice(999.99);
        $product->setStock(50);
        $product->setCategory('Electronics');

        $this->assertEquals('Laptop', $product->getName());
        $this->assertEquals('A good laptop', $product->getDescription());
        $this->assertEquals(999.99, $product->getPrice());
        $this->assertEquals(50, $product->getStock());
        $this->assertEquals('Electronics', $product->getCategory());
        $this->assertNotNull($product->getCreatedAt());
    }
}

class OrderItemTest extends TestCase
{
    public function test_order_item_subtotal(): void
    {
        $item = new OrderItem;
        $item->setUnitPrice(29.99);
        $item->setQuantity(3);

        $this->assertEquals(89.97, $item->getSubtotal());
    }
}
