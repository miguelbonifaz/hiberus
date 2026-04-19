<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250418000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create products, orders, and order_items tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE products (id SERIAL PRIMARY KEY NOT NULL, name VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, price DOUBLE PRECISION NOT NULL, stock INT NOT NULL, category VARCHAR(50) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL)');
        $this->addSql('CREATE TABLE orders (id SERIAL PRIMARY KEY NOT NULL, customer_id INT NOT NULL, status VARCHAR(20) NOT NULL, total DOUBLE PRECISION NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, paid_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL)');
        $this->addSql('CREATE TABLE order_items (id SERIAL PRIMARY KEY NOT NULL, order_id INT NOT NULL, product_id INT NOT NULL, quantity INT NOT NULL, unit_price DOUBLE PRECISION NOT NULL)');
        $this->addSql('CREATE INDEX IDX_ORDER_ITEMS_ORDER ON order_items (order_id)');
        $this->addSql('CREATE INDEX IDX_ORDER_ITEMS_PRODUCT ON order_items (product_id)');
        $this->addSql('ALTER TABLE order_items ADD CONSTRAINT FK_ORDER_ITEMS_ORDER FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_items ADD CONSTRAINT FK_ORDER_ITEMS_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE order_items DROP CONSTRAINT FK_ORDER_ITEMS_ORDER');
        $this->addSql('ALTER TABLE order_items DROP CONSTRAINT FK_ORDER_ITEMS_PRODUCT');
        $this->addSql('DROP TABLE order_items');
        $this->addSql('DROP TABLE orders');
        $this->addSql('DROP TABLE products');
    }
}
