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
import { authSuccess, authFailure, logout } from "../controllers/AuthController.js";
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
  passport.authenticate("google", {
    successRedirect: "/auth/success",
    failureRedirect: "/auth/failure",
  })
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

export default router;
