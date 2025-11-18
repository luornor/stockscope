FROM python:3.12-slim


ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1


WORKDIR /app


RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt


COPY . /app/

# ensure entrypoint is executable (if entrypoint.sh is in backend/)
RUN chmod +x /app/entrypoint.sh

# create a non-root user and give ownership of /app
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# run entrypoint first, then CMD is used as arguments to the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "stock_scope.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
