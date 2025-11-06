.PHONY: build up down logs shell migrate createsuperuser makemigrations startproject startapp

# accept either NAME=... or name=... from the CLI
NAME := $(or $(NAME),$(name))

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down -v

logs:
	docker compose logs -f --tail=200

shell:
	docker compose exec backend bash

migrate:
	docker compose exec backend python manage.py migrate

makemigrations:
	docker compose exec backend python manage.py makemigrations

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

startproject:
	docker compose run --rm backend django-admin startproject $(NAME) .

startapp:
ifndef NAME
	$(error NAME is not set. Usage: make startapp NAME=<app_name>)
endif
	docker compose run --rm backend python manage.py startapp $(NAME)
