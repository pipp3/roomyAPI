/**
 * @swagger
 * components:
 *   schemas:
 *     Reserva:
 *       type: object
 *       required:
 *         - sala
 *         - fecha
 *         - horaInicio
 *         - horaFin
 *       properties:
 *         sala:
 *           type: string
 *           description: Nombre de la sala
 *           enum: [Sala1, Sala2, Sala3, Sala4, Sala5, Sala6, Sala7, Sala8, Sala9, Sala10]
 *         fecha:
 *           type: string
 *           description: Fecha de la reserva (formato DD/MM/YYYY)
 *         horaInicio:
 *           type: string
 *           description: Hora de inicio (formato HH:mm)
 *         horaFin:
 *           type: string
 *           description: Hora de fin (formato HH:mm)
 *         usuarioId:
 *           type: string
 *           description: ID del usuario que hace la reserva
 *       example:
 *         sala: Sala1
 *         fecha: 01/04/2024
 *         horaInicio: 09:00
 *         horaFin: 10:00
 *         usuarioId: 507f1f77bcf86cd799439011
 */

import express from "express";
import { obtenerReservas, crearReserva, actualizarReserva, eliminarReserva, obtenerReservasPorUsuario, obtenerDisponibilidadSala } from "../controllers/ReservaController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * /api/reservas:
 *   get:
 *     summary: Obtiene todas las reservas del usuario autenticado
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserva'
 *       401:
 *         description: No autorizado
 */
router.get("/", verifyToken, obtenerReservas);

/**
 * @swagger
 * /api/reservas:
 *   post:
 *     summary: Crea una nueva reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reserva'
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post("/", verifyToken, crearReserva);

/**
 * @swagger
 * /api/reservas/{id}:
 *   put:
 *     summary: Actualiza una reserva existente
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reserva'
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 */
router.put("/:id", verifyToken, actualizarReserva);

/**
 * @swagger
 * /api/reservas/{id}:
 *   delete:
 *     summary: Elimina una reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 */
router.delete("/:id", verifyToken, eliminarReserva);

/**
 * @swagger
 * /api/reservas/mis-reservas:
 *   get:
 *     summary: Obtiene las reservas del usuario actual
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserva'
 *       401:
 *         description: No autorizado
 */
router.get("/mis-reservas", verifyToken, obtenerReservasPorUsuario);

/**
 * @swagger
 * /api/reservas/disponibilidad:
 *   get:
 *     summary: Obtiene los horarios disponibles para una sala en una fecha específica
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sala
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Sala1, Sala2, Sala3, Sala4, Sala5, Sala6, Sala7, Sala8, Sala9, Sala10]
 *         description: Nombre de la sala
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *         description: Fecha en formato DD/MM/YYYY
 *     responses:
 *       200:
 *         description: Horarios disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sala:
 *                   type: string
 *                 fecha:
 *                   type: string
 *                 horariosDisponibles:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.get("/disponibilidad", verifyToken, obtenerDisponibilidadSala);

export default router;
