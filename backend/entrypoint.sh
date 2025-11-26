#!/usr/bin/env bash
set -Eeuo pipefail

echo "Entrypoint started"

# Wait for DB
echo "Waiting for database..."
until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}"; do
  echo "Postgres not ready, sleeping..."
  sleep 2
done

# Show Python and DB info (debug)
python --version
echo "Using DB: $DATABASE_URL"
python -c "from django.conf import settings; print(settings.DATABASES)"

# Run migrations
echo "Applying migrations..."
python manage.py migrate --noinput --verbosity 3

# Collect static
echo "Collecting static..."
python manage.py collectstatic --noinput

# Start server
echo "Starting server..."
if [ "$#" -gt 0 ]; then
  exec "$@"
else
  exec gunicorn stock_scope.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers "${WEB_CONCURRENCY:-2}"
fi
