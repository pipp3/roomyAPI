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

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 3600000, // 1 hora
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/reservas', reservaRoutes);
app.use('/auth', AuthRoutes); // Ruta para OAuth2

export default app;
