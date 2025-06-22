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
        
        // Extraer la URL de la imagen de perfil
        const avatarUrl = googleUser.photos && googleUser.photos[0] ? googleUser.photos[0].value : null;
        
        if (!usuario) {
            usuario = await Usuario.create({
                googleId: googleUser.id,
                email: googleUser.emails[0].value,
                nombre: googleUser.displayName,
                avatar: avatarUrl
            });
        } else {
            // Actualizar el avatar en caso de que haya cambiado
            if (avatarUrl && usuario.avatar !== avatarUrl) {
                usuario.avatar = avatarUrl;
                await usuario.save();
            }
        }

        // Generar un token JWT con el ID de MongoDB
        const token = jwt.sign(
            { 
                userId: usuario._id,
                email: usuario.email,
                nombre: usuario.nombre,
                avatar: usuario.avatar
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24*60*60*1000 
        });

        // Redirigir al frontend sin el token en la URL por seguridad
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/auth/callback`);
    } catch (error) {
        console.error('Error en authSuccess:', error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/login?error=auth_error`);
    }
};

export const authFailure = (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/login?error=auth_failed`);
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

export const getCurrentUser = async (req, res) => {
    try {
        // El middleware de autenticación ya verificó el token y puso el usuario en req.user
        const user = {
            id: req.user.id,
            email: req.user.email,
            nombre: req.user.nombre,
            avatar: req.user.avatar
        };
        
        res.json({ user });
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

