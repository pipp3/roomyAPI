import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Validaciones adicionales de seguridad
        if (!decoded.userId || !decoded.email) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        
        // Verificar que el token no sea demasiado viejo (opcional)
        const tokenAge = Date.now() - (decoded.iat * 1000);
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas en ms
        
        if (tokenAge > maxAge) {
            return res.status(401).json({ message: 'Token expired' });
        }
        
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            nombre: decoded.nombre,
            avatar: decoded.avatar
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else {
            return res.status(401).json({ message: 'Token verification failed' });
        }
    }
}