FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev libpq-dev \
    && docker-php-ext-install intl pdo pdo_pgsql pgsql zip \
    && a2enmod rewrite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --optimize-autoloader

COPY . .

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/var

COPY ./docker/apache/vhost.conf /etc/apache2/sites-available/000-default.conf
COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]