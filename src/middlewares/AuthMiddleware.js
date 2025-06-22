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
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            nombre: decoded.nombre,
            avatar: decoded.avatar
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}