#!/bin/bash

# Script de despliegue para RoomyAPI
echo "🚀 Iniciando despliegue de RoomyAPI..."

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "📝 Copia env.example a .env y configura las variables de entorno"
    exit 1
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.prod.yml down

# Limpiar imágenes antiguas (opcional)
read -p "¿Deseas limpiar imágenes Docker antiguas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Limpiando imágenes Docker antiguas..."
    docker system prune -f
fi

# Construir nuevas imágenes
echo "🔨 Construyendo nuevas imágenes..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
echo "▶️ Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Verificar estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose -f docker-compose.prod.yml ps

# Mostrar logs
echo "📋 Mostrando logs recientes..."
docker-compose -f docker-compose.prod.yml logs --tail=50

echo "✅ ¡Despliegue completado!"
echo "🌐 API disponible en: https://tu-dominio.com"
echo "📖 Documentación en: https://tu-dominio.com/api-docs" 