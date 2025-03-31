# RoomyApi - API de Reserva de Salas

API REST para gestionar reservas de salas de reuniones. Desarrollada con Node.js, Express y MongoDB.

## 🚀 Características

- Autenticación con Google OAuth2
- Gestión de reservas de salas
- Verificación de disponibilidad de horarios
- Validación de fechas y horarios
- Sistema de roles y permisos
- Manejo de sesiones
- Documentación con Swagger

## 📋 Prerrequisitos

- Node.js (v14 o superior)
- MongoDB
- Cuenta de Google para OAuth2

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/roomyApi.git
cd roomyApi
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo .env en la raíz del proyecto:
```env
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
MONGODB_URI=mongodb://localhost:27017/roomy
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRES_IN=1d
NODE_ENV=development
SESSION_SECRET=roomy_session_secret_key

```

4. Iniciar el servidor:
```bash
npm start
```

## 🏗️ Estructura del Proyecto

```
roomyApi/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   ├── controllers/
│   │   ├── AuthController.js
│   │   └── ReservaController.js
│   ├── middlewares/
│   │   └── AuthMiddleware.js
│   ├── models/
│   │   ├── Reserva.js
│   │   └── Usuario.js
│   ├── routes/
│   │   ├── AuthRoutes.js
│   │   └── ReservaRoutes.js
│   ├── utils/
│   │   └── dateUtils.js
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Autenticación

La API utiliza autenticación JWT y Google OAuth2. Para obtener las credenciales de Google:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita la API de Google+ API
4. Crea credenciales OAuth2
5. Configura las URIs de redirección autorizadas

## 📡 Endpoints

### Autenticación

#### POST /auth/google
- Inicia el proceso de autenticación con Google
- No requiere autenticación

#### GET /auth/google/callback
- Callback de Google OAuth2
- No requiere autenticación

### Reservas

#### GET /api/reservas
- Obtiene todas las reservas del usuario autenticado
- Requiere token JWT
- Respuesta:
```json
[
  {
    "_id": "...",
    "sala": "Sala1",
    "fecha": "01/04/2024",
    "horaInicio": "09:00",
    "horaFin": "10:00",
    "usuarioId": "..."
  }
]
```

#### POST /api/reservas
- Crea una nueva reserva
- Requiere token JWT
- Body:
```json
{
  "sala": "Sala1",
  "fecha": "01/04/2024",
  "horaInicio": "09:00",
  "horaFin": "10:00"
}
```

#### PUT /api/reservas/:id
- Actualiza una reserva existente
- Requiere token JWT
- Body (campos opcionales):
```json
{
  "sala": "Sala2",
  "fecha": "02/04/2024",
  "horaInicio": "10:00",
  "horaFin": "11:00"
}
```

#### DELETE /api/reservas/:id
- Elimina una reserva
- Requiere token JWT

#### GET /api/reservas/disponibilidad
- Obtiene los horarios disponibles para una sala en una fecha específica
- Requiere token JWT
- Query params:
  - sala: nombre de la sala
  - fecha: fecha en formato DD/MM/YYYY
- Respuesta:
```json
{
  "sala": "Sala1",
  "fecha": "01/04/2024",
  "horariosDisponibles": ["09:00", "09:30", "10:00", ...]
}
```

## ⚠️ Validaciones

### Reservas
- Fecha no puede ser anterior a hoy
- Horarios entre 9:00 y 18:00
- Duración mínima: 30 minutos
- Duración máxima: 3 horas
- Intervalos de 30 minutos
- No se permiten solapamientos de horarios

### Salas Disponibles
- Sala1 a Sala10

## 🐳 Docker

Para ejecutar con Docker:

```bash
docker-compose up --build
```

## 📝 Documentación API

La documentación completa de la API está disponible en:
```
http://localhost:5000/api-docs
```

## 🔍 Testing

Para ejecutar las pruebas:

```bash
npm test
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## ✉️ Contacto

Tu Nombre - [@tutwitter](https://twitter.com/tutwitter) - email@example.com

Link del Proyecto: [https://github.com/tu-usuario/roomyApi](https://github.com/tu-usuario/roomyApi)
