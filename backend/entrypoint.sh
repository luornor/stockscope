#!/usr/bin/env bash
set -Eeuo pipefail

echo "Entrypoint started"

# ---------------------------------------
# Resolve DB info (local or Aiven)
# ---------------------------------------

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Parsing DATABASE_URL..."

  export POSTGRES_HOST=$(python3 - <<EOF
import os
from urllib.parse import urlparse
url = urlparse(os.environ["DATABASE_URL"])
print(url.hostname)
EOF
)

  export POSTGRES_PORT=$(python3 - <<EOF
import os
from urllib.parse import urlparse
url = urlparse(os.environ["DATABASE_URL"])
print(url.port)
EOF
)

  export POSTGRES_USER=$(python3 - <<EOF
import os
from urllib.parse import urlparse
url = urlparse(os.environ["DATABASE_URL"])
print(url.username)
EOF
)

  export POSTGRES_DB=$(python3 - <<EOF
import os
from urllib.parse import urlparse
url = urlparse(os.environ["DATABASE_URL"])
print(url.path[1:] or "")
EOF
)
fi


# ---------------------------------------
# Wait for DB (works for local & Aiven)
# ---------------------------------------

echo "Waiting for database at $POSTGRES_HOST:$POSTGRES_PORT..."

until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER"; do
  echo "Postgres not ready, sleeping..."
  sleep 2
done

echo "Database is ready!"

# ---------------------------------------
# Django setup
# ---------------------------------------

python --version
echo "Running migrations..."
python manage.py migrate --noinput --verbosity 2

echo "Collecting static..."
python manage.py collectstatic --noinput

echo "Starting server..."
exec gunicorn stock_scope.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers "${WEB_CONCURRENCY:-2}"
