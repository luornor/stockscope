# ...existing code...
#!/usr/bin/env bash
set -Eeuo pipefail

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static..."
python manage.py collectstatic --noinput

echo "Starting server..."
# If a command was provided (e.g. via docker-compose) run it, otherwise default to gunicorn.
if [ "$#" -gt 0 ]; then
  exec "$@"
else
  exec gunicorn stock_scope.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers "${WEB_CONCURRENCY:-2}"
fi
# ...existing code...