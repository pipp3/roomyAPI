import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

import connectDB from './config/db.js';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';
import AuthRoutes from './routes/AuthRoutes.js';
import reservaRoutes from './routes/ReservaRoutes.js';

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware de debugging para todas las requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
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
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(cookieParser());

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 3600000, // 1 hora
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        httpOnly: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/reservas', reservaRoutes);
app.use('/api/auth', AuthRoutes); // Ruta para OAuth2 - CAMBIADO para incluir /api

// Ruta de prueba para verificar que el servidor funciona
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        apiUrl: process.env.API_URL,
        clientUrl: process.env.CLIENT_URL
    });
});

// Log de rutas registradas
console.log('🚀 Rutas registradas:');
console.log('  - /api/auth/* (incluyendo /api/auth/google/callback)');
console.log('  - /api/reservas/*');
console.log('  - /health');
console.log('  - /api-docs');

// Handler para rutas no encontradas (404)
app.use('*', (req, res) => {
    console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    console.log('Available routes:');
    console.log('  - GET /api/auth/google');
    console.log('  - GET /api/auth/google/callback');
    console.log('  - GET /api/auth/test');
    console.log('  - GET /health');
    
    res.status(404).json({
        error: 'Ruta no encontrada',
        method: req.method,
        url: req.originalUrl,
        availableRoutes: [
            'GET /api/auth/google',
            'GET /api/auth/google/callback',
            'GET /api/auth/test',
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
