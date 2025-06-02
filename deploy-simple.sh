#!/bin/bash

# Script de despliegue simple para RoomyAPI (sin dominio)
echo "🚀 Iniciando despliegue simple de RoomyAPI..."

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "📝 Copia env.example a .env y configura las variables de entorno"
    exit 1
fi

# Obtener IP del servidor
VPS_IP=$(curl -s ifconfig.me)
echo "📍 IP del servidor: $VPS_IP"

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.simple.yml down

# Construir nuevas imágenes
echo "🔨 Construyendo nuevas imágenes..."
docker-compose -f docker-compose.simple.yml build --no-cache

# Iniciar servicios
echo "▶️ Iniciando servicios..."
docker-compose -f docker-compose.simple.yml up -d

# Verificar estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose -f docker-compose.simple.yml ps

# Mostrar información de acceso
echo ""
echo "✅ ¡Despliegue completado!"
echo "🌐 API disponible en: http://$VPS_IP:5000"
echo "📖 Documentación en: http://$VPS_IP:5000/api-docs"
echo ""
echo "🔧 Para acceder desde tu aplicación cliente:"
echo "   - API_URL=http://$VPS_IP:5000"
echo "   - Asegúrate de que el puerto 5000 esté abierto en tu firewall" 