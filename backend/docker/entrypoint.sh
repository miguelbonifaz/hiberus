#!/bin/bash
set -e

echo "Clearing cache..."
php bin/console cache:clear --no-interaction || true

echo "Running migrations..."
php bin/console doctrine:migrations:migrate --no-interaction || true

echo "Loading fixtures..."
php bin/console doctrine:fixtures:load --no-interaction || true

echo "Starting Apache..."
apache2-foreground