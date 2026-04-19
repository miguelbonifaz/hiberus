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
            ['name' => 'Noise-Canceling Headphones HC3', 'description' => 'Over-ear headphones with active noise cancellation', 'price' => 199.99, 'stock' => 65, 'category' => 'Electronics'],
            ['name' => 'Portable SSD 1TB', 'description' => 'Compact external SSD with USB-C interface', 'price' => 109.99, 'stock' => 140, 'category' => 'Electronics'],
            ['name' => 'Bluetooth Speaker Mini', 'description' => 'Waterproof portable speaker with 12h battery', 'price' => 44.99, 'stock' => 220, 'category' => 'Electronics'],
            ['name' => '4K Monitor 27"', 'description' => 'IPS 4K display with USB-C power delivery', 'price' => 449.99, 'stock' => 35, 'category' => 'Electronics'],
            ['name' => 'Wireless Charging Pad Q1', 'description' => 'Qi-compatible fast wireless charger', 'price' => 24.99, 'stock' => 180, 'category' => 'Accessories'],
            ['name' => 'Cable Management Kit', 'description' => 'Under-desk cable tray with clips and ties', 'price' => 19.99, 'stock' => 250, 'category' => 'Accessories'],
            ['name' => 'Laptop Sleeve 15"', 'description' => 'Neoprene protective sleeve for 15" laptops', 'price' => 22.99, 'stock' => 160, 'category' => 'Accessories'],
            ['name' => 'Vertical Mouse VM100', 'description' => 'Ergonomic vertical mouse for wrist relief', 'price' => 39.99, 'stock' => 110, 'category' => 'Electronics'],
            ['name' => 'Standing Desk Frame', 'description' => 'Electric height-adjustable desk frame with memory presets', 'price' => 349.99, 'stock' => 25, 'category' => 'Furniture'],
            ['name' => 'Ergonomic Chair E900', 'description' => 'Mesh office chair with lumbar support and headrest', 'price' => 299.99, 'stock' => 40, 'category' => 'Furniture'],
            ['name' => 'Desk Organizer Pro', 'description' => 'Bamboo desk organizer with phone slot and drawer', 'price' => 29.99, 'stock' => 130, 'category' => 'Furniture'],
            ['name' => 'Monitor Light Bar', 'description' => 'Asymmetric screen light bar with adjustable brightness', 'price' => 54.99, 'stock' => 75, 'category' => 'Accessories'],
            ['name' => 'Webcam Ring Light', 'description' => 'Clip-on LED ring light for video calls', 'price' => 19.99, 'stock' => 200, 'category' => 'Accessories'],
            ['name' => 'Mechanical Numpad N1', 'description' => 'Compact USB numpad with mechanical switches', 'price' => 34.99, 'stock' => 95, 'category' => 'Electronics'],
            ['name' => 'Anti-Fatigue Mat', 'description' => 'Standing desk comfort mat, beveled edges', 'price' => 49.99, 'stock' => 60, 'category' => 'Furniture'],
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
