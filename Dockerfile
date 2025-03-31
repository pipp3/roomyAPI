# Imagen base de Node.js
FROM node:20-alpine

# Establecer directorio de trabajo en el contenedor
WORKDIR /app

# Instalar dependencias del sistema (bash y otros utilitarios)
RUN apk add --no-cache bash

# Copiar package.json e instalar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto del servidor
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev"]
