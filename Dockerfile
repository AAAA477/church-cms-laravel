# Church CMS — Laravel backend (admin API, mobile API, media).
# Serves HTTP on :80 via Apache + mod_php. The same image runs the
# scheduler when started with the "scheduler" command (see entrypoint).

FROM php:8.4-apache

# System deps + PHP extensions (pdo_pgsql for Postgres, gd/zip for
# maatwebsite/excel + dompdf + medialibrary, intl/bcmath/exif for misc
# vendor requirements, opcache for production).
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN apt-get update && apt-get install -y --no-install-recommends git unzip postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions pdo_pgsql pgsql gd zip bcmath exif intl opcache pcntl

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache: docroot -> public/, enable rewrite for Laravel's front controller.
RUN a2enmod rewrite headers \
    && sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf /etc/apache2/apache2.conf \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf

COPY deploy/docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini

WORKDIR /var/www/html

# Install vendor first so code-only changes don't bust the composer cache.
# custompackages/ is a composer path repository and must exist beforehand.
COPY composer.json composer.lock ./
COPY custompackages ./custompackages
RUN composer install --no-dev --prefer-dist --no-interaction --no-scripts --no-autoloader

COPY . .

# config/church-cms.php is in composer autoload "files", and package:discover
# boots the framework, so this runs only after the full source is in place.
RUN composer dump-autoload --optimize --no-dev \
    && php artisan package:discover --ansi

RUN chown -R www-data:www-data storage bootstrap/cache public/uploads

COPY deploy/docker/entrypoint.sh /usr/local/bin/app-entrypoint
RUN chmod +x /usr/local/bin/app-entrypoint

ENTRYPOINT ["app-entrypoint"]
CMD ["apache2-foreground"]
