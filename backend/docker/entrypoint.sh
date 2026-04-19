#!/bin/bash
set -e

echo "Running migrations..."
php bin/console doctrine:migrations:migrate --no-interaction || true

echo "Loading fixtures..."
php bin/console doctrine:fixtures:load --no-interaction || true

echo "Starting Apache..."
apache2-foreground