# Imagen base de Node.js
FROM node:20-alpine

# Establecer directorio de trabajo en el contenedor
WORKDIR /app

# Instalar dependencias del sistema (bash y otros utilitarios)
RUN apk add --no-cache bash

# Copiar package.json e instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar el resto del código fuente
COPY . .

# Cambiar propietario de los archivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer el puerto del servidor
EXPOSE 5000

# Comando para ejecutar la aplicación en producción
CMD ["npm", "start"]
