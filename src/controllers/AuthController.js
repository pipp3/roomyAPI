import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Usuario from '../models/Usuario.js';

dotenv.config();

export const authSuccess = async (req, res) => {
    try {
        const googleUser = req.user;
        console.log('Datos de Google:', googleUser);

        if (!googleUser || !googleUser.id || !googleUser.emails || !googleUser.emails[0] || !googleUser.displayName) {
            return res.status(400).json({
                message: "Datos de Google incompletos",
                error: "Faltan datos requeridos del usuario de Google"
            });
        }

        // Buscar o crear usuario en nuestra base de datos
        let usuario = await Usuario.findOne({ googleId: googleUser.id });
        
        if (!usuario) {
            usuario = await Usuario.create({
                googleId: googleUser.id,
                email: googleUser.emails[0].value,
                nombre: googleUser.displayName
            });
        }

        // Generar un token JWT con el ID de MongoDB
        const token = jwt.sign(
            { 
                userId: usuario._id,
                email: usuario.email,
                nombre: usuario.nombre
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 24*60*60*1000 
        });

        res.json({ 
            message: "Autenticado con éxito", 
            token,
            usuario: {
                id: usuario._id,
                email: usuario.email,
                nombre: usuario.nombre
            }
        });
    } catch (error) {
        console.error('Error en authSuccess:', error);
        res.status(500).json({ 
            message: "Error en la autenticación", 
            error: error.message 
        });
    }
};

export const authFailure = (req, res) => {
    res.status(401).json({ message: "Error en la autenticación" });
};

export const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Error al cerrar sesión" });
        }
        res.clearCookie('token');
        res.json({ message: "Sesión cerrada" });
    });
};

