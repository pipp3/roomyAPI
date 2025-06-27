/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - email
 *         - nombre
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         googleId:
 *           type: string
 *           description: ID de Google del usuario
 *       example:
 *         email: usuario@ejemplo.com
 *         nombre: Usuario Ejemplo
 *         googleId: 123456789
 */

import express from "express";
import passport from "passport";
import { authSuccess, authFailure, logout, getCurrentUser } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
const router = express.Router();

// Log para verificar que las rutas se están cargando
console.log('🔧 Cargando rutas de autenticación...');

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Inicia el proceso de autenticación con Google
 *     tags: [Autenticación]
 *     responses:
 *       302:
 *         description: Redirecciona a Google para autenticación
 */
router.get("/google", (req, res, next) => {
  console.log('🔍 Ruta /google llamada');
  next();
}, passport.authenticate("google", { 
  scope: ["profile", "email"]
}));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback de Google después de la autenticación
 *     tags: [Autenticación]
 *     responses:
 *       302:
 *         description: Redirecciona a /auth/success o /auth/failure
 */
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log('🔍 Ruta /google/callback llamada');
    console.log('Query params:', req.query);
    next();
  },
  passport.authenticate("google", { 
    failureRedirect: "/api/auth/failure",
    session: false 
  }),
  authSuccess // Usar authSuccess que tiene la firma correcta (req, res)
);

/**
 * @swagger
 * /auth/success:
 *   get:
 *     summary: Maneja el éxito de la autenticación
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Autenticación exitosa
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 */
router.get("/success", authSuccess);

/**
 * @swagger
 * /auth/failure:
 *   get:
 *     summary: Maneja el fallo de la autenticación
 *     tags: [Autenticación]
 *     responses:
 *       401:
 *         description: Autenticación fallida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error de autenticación
 */
router.get("/failure", authFailure);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Cierra la sesión del usuario
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout exitoso
 */
router.get("/logout", logout);

/**
 * @swagger
 * /auth/test:
 *   get:
 *     summary: Endpoint de prueba para verificar que el servidor funciona
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 */
router.get("/test", (req, res) => {
    res.json({ 
        message: "Servidor funcionando correctamente", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        apiUrl: process.env.API_URL,
        clientUrl: process.env.CLIENT_URL,
        googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Configurado' : 'No configurado',
        mongoUri: process.env.MONGO_URI ? 'Configurado' : 'No configurado',
        jwtSecret: process.env.JWT_SECRET ? 'Configurado' : 'No configurado'
    });
});

/**
 * @swagger
 * /auth/debug:
 *   get:
 *     summary: Endpoint de debug para verificar rutas disponibles
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Información de debug
 */
router.get("/debug", (req, res) => {
    res.json({
        message: "Rutas de autenticación disponibles",
        routes: [
            "GET /api/auth/google - Iniciar autenticación con Google",
            "GET /api/auth/google/callback - Callback de Google",
            "GET /api/auth/test - Prueba del servidor",
            "GET /api/auth/debug - Esta ruta",
            "GET /api/auth/me - Obtener usuario actual (requiere token)"
        ],
        timestamp: new Date().toISOString()
    });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtiene la información del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No token provided
 */
router.get("/me", verifyToken, getCurrentUser);

console.log('✅ Rutas de autenticación cargadas correctamente');

export default router;
