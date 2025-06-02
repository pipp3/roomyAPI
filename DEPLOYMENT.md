# 🚀 Guía de Despliegue - RoomyAPI

Esta guía te ayudará a desplegar RoomyAPI en un VPS usando Docker y Nginx.

## 📋 Prerrequisitos

### En tu VPS:
- **Docker** y **Docker Compose** instalados
- **Nginx** (opcional, ya está incluido en Docker Compose)
- **Dominio** apuntando a tu VPS
- **Firewall** configurado (puertos 80, 443, 22)

### Instalación de Docker en Ubuntu/Debian:
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER
```

## 🔧 Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/roomyApi.git
cd roomyApi
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables de entorno
nano .env
```

**Variables importantes para producción:**
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://mongo:27017/roomydb

# Generar secretos seguros
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
SESSION_SECRET=tu_session_secret_super_seguro_aqui

# Google OAuth (obtener en console.cloud.google.com)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# URLs de producción
CLIENT_URL=https://tu-dominio.com
API_URL=https://tu-dominio.com
```

### 3. Configurar dominio en Nginx
```bash
# Editar nginx.conf
nano nginx.conf

# Cambiar "tu-dominio.com" por tu dominio real
sed -i 's/tu-dominio.com/tudominio.com/g' nginx.conf
```

### 4. Configurar SSL con Let's Encrypt

#### Opción A: Manual
```bash
# Instalar certbot
sudo apt install certbot -y

# Obtener certificados
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com

# Copiar certificados
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem ssl/
sudo chown -R $USER:$USER ssl/
```

#### Opción B: Con Docker
```bash
# Crear directorio para certificados
mkdir -p ssl

# Usar certbot en Docker
docker run -it --rm -v $(pwd)/ssl:/etc/letsencrypt/live/tudominio.com certbot/certbot certonly --standalone -d tudominio.com
```

## 🚀 Despliegue

### Usar script automatizado
```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
```

### Despliegue manual
```bash
# Detener servicios existentes
docker-compose -f docker-compose.prod.yml down

# Construir e iniciar
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar estado
docker-compose -f docker-compose.prod.yml ps
```

## 🔍 Verificación

### Comprobar servicios
```bash
# Estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Logs de la aplicación
docker-compose -f docker-compose.prod.yml logs backend

# Logs de Nginx
docker-compose -f docker-compose.prod.yml logs nginx

# Logs de MongoDB
docker-compose -f docker-compose.prod.yml logs mongo
```

### Endpoints de prueba
- **API**: `https://tudominio.com`
- **Documentación**: `https://tudominio.com/api-docs`
- **Health Check**: `https://tudominio.com/health` (si existe)

## 🛠 Mantenimiento

### Actualizar aplicación
```bash
# Pull cambios
git pull origin main

# Redesplegar
./deploy.sh
```

### Backup de base de datos
```bash
# Crear backup
docker exec roomy-db-prod mongodump --out /backup

# Copiar backup
docker cp roomy-db-prod:/backup ./backup-$(date +%Y%m%d)
```

### Restaurar backup
```bash
# Restaurar desde backup
docker cp ./backup-20231201 roomy-db-prod:/backup
docker exec roomy-db-prod mongorestore /backup
```

### Logs y monitoreo
```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver uso de recursos
docker stats

# Limpiar logs antiguos
docker system prune -f
```

## 🔒 Seguridad

### Configurar firewall
```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Configurar fail2ban
```bash
# Instalar fail2ban
sudo apt install fail2ban -y

# Configurar para SSH
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Renovación automática SSL
```bash
# Añadir a crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /ruta/a/tu/proyecto/docker-compose.prod.yml restart nginx" | sudo crontab -
```

## ❗ Solución de problemas

### Contenedor no inicia
```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs [servicio]

# Reiniciar servicio específico
docker-compose -f docker-compose.prod.yml restart [servicio]
```

### Error de conexión a MongoDB
```bash
# Verificar estado de MongoDB
docker-compose -f docker-compose.prod.yml exec mongo mongo --eval "db.adminCommand('ismaster')"

# Reiniciar MongoDB
docker-compose -f docker-compose.prod.yml restart mongo
```

### Problemas de SSL
```bash
# Verificar certificados
openssl x509 -in ssl/fullchain.pem -text -noout

# Renovar certificados
sudo certbot renew
```

## 📞 Soporte

Si encuentras problemas, verifica:
1. Logs de los contenedores
2. Variables de entorno
3. Configuración de DNS
4. Certificados SSL
5. Firewall y puertos

¡Tu API estará disponible en `https://tudominio.com`! 🎉 