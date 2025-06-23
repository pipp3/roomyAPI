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
import { authSuccess, authFailure, logout, getCurrentUser, authSuccessLogic } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
const router = express.Router();

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
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

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
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    // Aquí manejaremos directamente la respuesta en lugar de usar redirects
    try {
      const googleUser = req.user;
      console.log('🔍 Callback directo - Usuario recibido:', googleUser?.id);
      
      if (!googleUser || !googleUser.id || !googleUser.emails || !googleUser.emails[0] || !googleUser.displayName) {
        console.error('Datos de Google incompletos en callback:', googleUser);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        return res.redirect(`${clientUrl}/login?error=auth_error`);
      }

      // Llamar directamente a la lógica de authSuccess
      await authSuccessLogic(req, res, googleUser);
      
    } catch (error) {
      console.error('Error en callback directo:', error);
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${clientUrl}/login?error=auth_error`);
    }
  }
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
    res.json({ message: "Servidor funcionando correctamente", timestamp: new Date().toISOString() });
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

export default router;
