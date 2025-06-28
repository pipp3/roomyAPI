import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

import connectDB from './config/db.js';
import reservaRoutes from './routes/ReservaRoutes.js';

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware de debugging para todas las requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Configuración mejorada de CORS
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.API_URL,
    'http://localhost:3000',
    'http://localhost:5000'
].filter(Boolean); // Eliminar valores undefined/null

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes - Solo reservas ahora
app.use('/api/reservas', reservaRoutes);

// Ruta de prueba para verificar que el servidor funciona
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        message: 'Backend simplificado - Auth manejado por NextAuth.js'
    });
});

// Log de rutas registradas
console.log('🚀 Rutas registradas:');
console.log('  - /api/reservas/*');
console.log('  - /health');
console.log('  - /api-docs');
console.log('📝 Nota: Autenticación ahora manejada por NextAuth.js en el frontend');

// Handler para rutas no encontradas (404)
app.use('*', (req, res) => {
    console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    
    res.status(404).json({
        error: 'Ruta no encontrada',
        method: req.method,
        url: req.originalUrl,
        availableRoutes: [
            'GET /api/reservas',
            'POST /api/reservas',
            'PUT /api/reservas/:id',
            'DELETE /api/reservas/:id',
            'GET /health'
        ]
    });
});

// Handler de errores
app.use((error, req, res, next) => {
    console.error('❌ Error en la aplicación:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
    });
});

export default app;
