# Docker развертывание GIM Maps

Этот документ содержит инструкции по развертыванию фронтенд приложения GIM Maps с помощью Docker.

## Требования

- Docker (версия 20.10 или выше)
- Docker Compose (версия 2.0 или выше)

## Быстрый старт

### 1. Сборка и запуск с Docker Compose (рекомендуется)

```bash
# Клонируйте репозиторий (если еще не сделали)
git clone <your-repository-url>
cd GIM-maps-nogimcard

# Создайте папку для логов
mkdir logs

# Запустите приложение
docker-compose up -d

# Проверьте статус
docker-compose ps
```

Приложение будет доступно по адресу: http://localhost:3000

### 2. Остановка приложения

```bash
# Остановить контейнеры
docker-compose down

# Остановить и удалить контейнеры с образами
docker-compose down --rmi all
```

## Альтернативный способ: только Docker

### 1. Сборка образа

```bash
# Сборка образа
docker build -t gim-maps-frontend .

# Проверка созданного образа
docker images | grep gim-maps-frontend
```

### 2. Запуск контейнера

```bash
# Запуск контейнера
docker run -d \
  --name gim-maps-frontend \
  -p 3000:80 \
  --restart unless-stopped \
  gim-maps-frontend

# Проверка статуса
docker ps | grep gim-maps-frontend
```

### 3. Остановка и удаление

```bash
# Остановить контейнер
docker stop gim-maps-frontend

# Удалить контейнер
docker rm gim-maps-frontend

# Удалить образ
docker rmi gim-maps-frontend
```

## Полезные команды

### Просмотр логов

```bash
# Docker Compose
docker-compose logs -f gim-maps-frontend

# Docker
docker logs -f gim-maps-frontend
```

### Вход в контейнер

```bash
# Docker Compose
docker-compose exec gim-maps-frontend sh

# Docker
docker exec -it gim-maps-frontend sh
```

### Пересборка образа

```bash
# Docker Compose
docker-compose build --no-cache
docker-compose up -d

# Docker
docker build --no-cache -t gim-maps-frontend .
docker stop gim-maps-frontend
docker rm gim-maps-frontend
docker run -d --name gim-maps-frontend -p 3000:80 gim-maps-frontend
```

## Конфигурация

### Изменение порта

В `docker-compose.yml` измените маппинг портов:

```yaml
ports:
  - "8080:80"  # Внешний порт 8080
```

### Переменные окружения

Добавьте переменные окружения в `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - API_URL=http://your-backend-url
```

### Подключение к бэкенду

Если у вас есть бэкенд, раскомментируйте и настройте секцию `gim-maps-backend` в `docker-compose.yml`.

## Структура файлов

```
GIM-maps-nogimcard/
├── Dockerfile              # Инструкции для сборки образа
├── docker-compose.yml      # Конфигурация для Docker Compose
├── nginx.conf             # Конфигурация веб-сервера
├── .dockerignore          # Исключения для Docker контекста
├── DOCKER_README.md       # Эта инструкция
└── ...                    # Остальные файлы проекта
```

## Устранение неполадок

### Проблема: Порт уже занят

```bash
# Проверьте, что использует порт 3000
netstat -tulpn | grep :3000

# Измените порт в docker-compose.yml
```

### Проблема: Ошибка сборки

```bash
# Очистите кэш Docker
docker system prune -a

# Пересоберите образ
docker-compose build --no-cache
```

### Проблема: Приложение не загружается

```bash
# Проверьте логи
docker-compose logs gim-maps-frontend

# Проверьте статус контейнера
docker-compose ps
```

## Производительность

- Образ оптимизирован с помощью многоэтапной сборки
- Используется nginx для раздачи статических файлов
- Включено gzip сжатие
- Настроено кэширование статических ресурсов

## Безопасность

- Добавлены заголовки безопасности
- Используется Alpine Linux для минимального размера образа
- Настроена Content Security Policy 