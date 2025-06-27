import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Usuario from '../models/Usuario.js';

dotenv.config();

export const authSuccess = async (req, res) => {
    try {
        console.log('🔍 AuthController - authSuccess llamado');
        console.log('🔍 AuthController - req.user:', req.user);
        console.log('🔍 AuthController - req.isAuthenticated():', req.isAuthenticated());
        console.log('🔍 AuthController - req.session:', req.session);
        
        const googleUser = req.user;
        console.log('Datos completos de Google:', JSON.stringify(googleUser, null, 2));

        if (!googleUser || !googleUser.id || !googleUser.emails || !googleUser.emails[0] || !googleUser.displayName) {
            console.error('Datos de Google incompletos:', googleUser);
            console.error('🔍 Debug - googleUser existe:', !!googleUser);
            console.error('🔍 Debug - googleUser.id:', googleUser?.id);
            console.error('🔍 Debug - googleUser.emails:', googleUser?.emails);
            console.error('🔍 Debug - googleUser.displayName:', googleUser?.displayName);
            
            return res.status(400).json({
                message: "Datos de Google incompletos",
                error: "Faltan datos requeridos del usuario de Google"
            });
        }

        // Buscar o crear usuario en nuestra base de datos
        let usuario = await Usuario.findOne({ googleId: googleUser.id });
        
        // Extraer la URL de la imagen de perfil con mejor manejo
        let avatarUrl = null;
        if (googleUser.photos && googleUser.photos.length > 0) {
            avatarUrl = googleUser.photos[0].value;
            console.log('Avatar URL obtenida:', avatarUrl);
        } else {
            console.warn('No se encontró foto de perfil en los datos de Google');
        }
        
        if (!usuario) {
            console.log('Creando nuevo usuario...');
            usuario = await Usuario.create({
                googleId: googleUser.id,
                email: googleUser.emails[0].value,
                nombre: googleUser.displayName,
                avatar: avatarUrl
            });
            console.log('Usuario creado:', usuario);
        } else {
            console.log('Usuario existente encontrado, actualizando datos...');
            // Actualizar datos del usuario incluyendo el avatar
            let needsUpdate = false;
            
            if (usuario.email !== googleUser.emails[0].value) {
                usuario.email = googleUser.emails[0].value;
                needsUpdate = true;
            }
            
            if (usuario.nombre !== googleUser.displayName) {
                usuario.nombre = googleUser.displayName;
                needsUpdate = true;
            }
            
            if (avatarUrl && usuario.avatar !== avatarUrl) {
                usuario.avatar = avatarUrl;
                needsUpdate = true;
                console.log('Avatar actualizado a:', avatarUrl);
            }
            
            if (needsUpdate) {
                await usuario.save();
                console.log('Usuario actualizado:', usuario);
            }
        }

        // Generar un token JWT con el ID de MongoDB
        const tokenPayload = { 
            userId: usuario._id,
            email: usuario.email,
            nombre: usuario.nombre,
            avatar: usuario.avatar
        };
        
        console.log('Payload del token:', tokenPayload);
        
        const token = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24*60*60*1000, // 24 horas
            domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
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
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ message: "Error al cerrar sesión" });
        }
        
        // Limpiar la cookie del token
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
        });
        
        // Responder con éxito, sin redirigir
        res.json({ 
            message: "Sesión cerrada exitosamente",
            success: true 
        });
    });
};

export const getCurrentUser = async (req, res) => {
    try {
        // El middleware de autenticación ya verificó el token y puso el usuario en req.user
        console.log('Datos del usuario desde el token:', req.user);
        
        // También obtener los datos actualizados desde la base de datos
        const usuarioFromDB = await Usuario.findById(req.user.id);
        if (!usuarioFromDB) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        const user = {
            id: usuarioFromDB._id,
            email: usuarioFromDB.email,
            nombre: usuarioFromDB.nombre,
            avatar: usuarioFromDB.avatar,
            googleId: usuarioFromDB.googleId
        };
        
        console.log('Datos del usuario enviados al frontend:', user);
        res.json({ user });
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Función auxiliar para manejar la lógica de autenticación sin sesiones
export const authSuccessLogic = async (req, res, googleUser) => {
    try {
        console.log('🔍 AuthSuccessLogic - Procesando usuario:', googleUser?.id);
        console.log('Datos completos de Google:', JSON.stringify(googleUser, null, 2));

        if (!googleUser || !googleUser.id || !googleUser.emails || !googleUser.emails[0] || !googleUser.displayName) {
            console.error('Datos de Google incompletos:', googleUser);
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
            return res.redirect(`${clientUrl}/login?error=auth_error`);
        }

        // Buscar o crear usuario en nuestra base de datos
        let usuario = await Usuario.findOne({ googleId: googleUser.id });
        
        // Extraer la URL de la imagen de perfil con mejor manejo
        let avatarUrl = null;
        if (googleUser.photos && googleUser.photos.length > 0) {
            avatarUrl = googleUser.photos[0].value;
            console.log('Avatar URL obtenida:', avatarUrl);
        } else {
            console.warn('No se encontró foto de perfil en los datos de Google');
        }
        
        if (!usuario) {
            console.log('Creando nuevo usuario...');
            usuario = await Usuario.create({
                googleId: googleUser.id,
                email: googleUser.emails[0].value,
                nombre: googleUser.displayName,
                avatar: avatarUrl
            });
            console.log('Usuario creado:', usuario);
        } else {
            console.log('Usuario existente encontrado, actualizando datos...');
            // Actualizar datos del usuario incluyendo el avatar
            let needsUpdate = false;
            
            if (usuario.email !== googleUser.emails[0].value) {
                usuario.email = googleUser.emails[0].value;
                needsUpdate = true;
            }
            
            if (usuario.nombre !== googleUser.displayName) {
                usuario.nombre = googleUser.displayName;
                needsUpdate = true;
            }
            
            if (avatarUrl && usuario.avatar !== avatarUrl) {
                usuario.avatar = avatarUrl;
                needsUpdate = true;
                console.log('Avatar actualizado a:', avatarUrl);
            }
            
            if (needsUpdate) {
                await usuario.save();
                console.log('Usuario actualizado:', usuario);
            }
        }

        // Generar un token JWT con el ID de MongoDB
        const tokenPayload = { 
            userId: usuario._id,
            email: usuario.email,
            nombre: usuario.nombre,
            avatar: usuario.avatar
        };
        
        console.log('Payload del token:', tokenPayload);
        
        const token = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: true,
            sameSite: 'none',
            domain: '.roomyapp.duckdns.org', // Nota el punto al inicio para subdominios
            maxAge: 24*60*60*1000,
            path: '/'
          });
        console.log('🎉 AuthSuccessLogic - Autenticación completada, redirigiendo al frontend');

        // Redirigir al frontend sin el token en la URL por seguridad
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/auth/callback`);
    } catch (error) {
        console.error('Error en authSuccessLogic:', error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/login?error=auth_error`);
    }
};

