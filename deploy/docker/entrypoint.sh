#!/bin/sh
# Laravel container entrypoint. The storage/ and public/uploads volumes are
# seeded from the image on first run; this script repairs anything a fresh
# (or hand-mounted) volume may be missing, then execs the requested process.
set -e

cd /var/www/html

mkdir -p storage/logs \
         storage/app/public \
         storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views
chown -R www-data:www-data storage bootstrap/cache public/uploads

# public/storage -> storage/app/public (media library URLs depend on it)
php artisan storage:link --force

if [ "$MIGRATE_ON_START" = "1" ]; then
    php artisan migrate --force
fi

if [ "$1" = "scheduler" ]; then
    # Runs due tasks every minute in the foreground (birthday/anniversary
    # checks, mail queue, subscription checks — see app/Console/Kernel.php).
    exec php artisan schedule:work
fi

exec "$@"
