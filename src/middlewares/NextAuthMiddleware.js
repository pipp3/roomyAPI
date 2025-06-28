// Middleware simple para extraer información del usuario desde NextAuth.js
export const extractUserInfo = (req, res, next) => {
    // NextAuth.js puede enviar la información del usuario en headers personalizados
    // o podemos recibirla en el body de las requests POST
    
    // Por ahora, vamos a hacer las reservas sin autenticación estricta
    // y permitir que se envíe la información del usuario en el body
    
    // En el futuro, podrías verificar tokens JWT de NextAuth aquí si es necesario
    
    console.log('📝 Request recibida para reservas');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    next();
};

// Middleware alternativo si quieres verificar tokens JWT de NextAuth
export const verifyNextAuthToken = async (req, res, next) => {
    try {
        // Aquí podrías verificar el token de NextAuth.js si es necesario
        // Por ahora, permitimos todas las requests
        
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            console.log('Token recibido:', token.substring(0, 20) + '...');
        }
        
        next();
    } catch (error) {
        console.error('Error en verificación de token:', error);
        return res.status(401).json({ message: 'Token inválido' });
    }
}; 