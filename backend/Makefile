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
	docker compose exec stockscope_api bash

migrate:
	docker compose exec stockscope_apiq python manage.py migrate

makemigrations:
	docker compose exec stockscope_api python manage.py makemigrations

createsuperuser:
	docker compose exec stockscope_api python manage.py createsuperuser

startproject:
	docker compose run --rm stockscope_api django-admin startproject $(NAME) .

startapp:
ifndef NAME
	$(error NAME is not set. Usage: make startapp NAME=<app_name>)
endif
	docker compose run --rm stockscope_api python manage.py startapp $(NAME)
