import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';
import AuthRoutes from './routes/AuthRoutes.js';
import reservaRoutes from './routes/ReservaRoutes.js';
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();
// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
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

// Routes
app.use('/api/reservas', reservaRoutes);
app.use('/auth', AuthRoutes);
// Start server
app.get('/', (req, res) => {
    res.send('Hello World');
});

export default app;
