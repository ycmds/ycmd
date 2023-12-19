#!/bin/sh

# Сборка Docker образа
docker build --platform linux/amd64  -t test_image . 

# Запуск контейнера и проверка установки pnpm и ycmd
docker run --rm test_image sh -c "ycmd --version"