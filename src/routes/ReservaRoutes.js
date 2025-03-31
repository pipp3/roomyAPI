import express from "express";
import { obtenerReservas, crearReserva, actualizarReserva, eliminarReserva, obtenerReservasPorUsuario, obtenerDisponibilidadSala } from "../controllers/ReservaController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
const router = express.Router();

router.get("/", verifyToken, obtenerReservas);
router.post("/", verifyToken, crearReserva);
router.put("/:id", verifyToken, actualizarReserva);
router.delete("/:id", verifyToken, eliminarReserva);
router.get("/mis-reservas", verifyToken, obtenerReservasPorUsuario);
router.get("/disponibilidad", verifyToken, obtenerDisponibilidadSala);

export default router;
