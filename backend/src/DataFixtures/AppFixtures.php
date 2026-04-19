<?php

namespace App\DataFixtures;

use App\Entity\Product;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $products = [
            ['name' => 'Laptop Pro X1', 'description' => 'High-performance laptop for professionals', 'price' => 1299.99, 'stock' => 50, 'category' => 'Electronics'],
            ['name' => 'Wireless Mouse M200', 'description' => 'Ergonomic wireless mouse', 'price' => 29.99, 'stock' => 200, 'category' => 'Electronics'],
            ['name' => 'Mechanical Keyboard K500', 'description' => 'RGB mechanical keyboard with Cherry MX switches', 'price' => 89.99, 'stock' => 150, 'category' => 'Electronics'],
            ['name' => 'USB-C Hub 7-in-1', 'description' => 'Multi-port adapter for laptops', 'price' => 49.99, 'stock' => 300, 'category' => 'Accessories'],
            ['name' => 'Monitor Stand S100', 'description' => 'Adjustable monitor stand with storage', 'price' => 39.99, 'stock' => 100, 'category' => 'Furniture'],
            ['name' => 'Webcam HD 1080p', 'description' => 'Full HD webcam with built-in mic', 'price' => 69.99, 'stock' => 80, 'category' => 'Electronics'],
            ['name' => 'Desk Lamp LED', 'description' => 'Adjustable LED desk lamp with USB charging', 'price' => 34.99, 'stock' => 120, 'category' => 'Furniture'],
            ['name' => 'Laptop Backpack B50', 'description' => 'Water-resistant laptop backpack up to 17"', 'price' => 59.99, 'stock' => 90, 'category' => 'Accessories'],
        ];

        foreach ($products as $data) {
            $product = new Product;
            $product->setName($data['name']);
            $product->setDescription($data['description']);
            $product->setPrice($data['price']);
            $product->setStock($data['stock']);
            $product->setCategory($data['category']);
            $manager->persist($product);
        }

        $manager->flush();
    }
}
