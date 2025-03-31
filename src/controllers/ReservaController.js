import Reserva from "../models/Reserva.js";
import mongoose from 'mongoose';
import { formatearFecha, formatearFechaToString } from '../utils/dateUtils.js';

// Obtener todas las reservas
export const obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find({ usuarioId: new mongoose.Types.ObjectId(req.user.id) });
    // Formatear las fechas en la respuesta
    const reservasFormateadas = reservas.map(reserva => ({
      ...reserva.toObject(),
      fecha: formatearFechaToString(reserva.fecha)
    }));
    res.json(reservasFormateadas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, espacio, horaInicio, horaFin } = req.body;

    // Buscar la reserva existente
    const reservaExistente = await Reserva.findOne({ 
      _id: id, 
      usuarioId: req.user.id 
    });

    if (!reservaExistente) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // Validar fecha si se proporciona
    let fechaReserva;
    if (fecha) {
      try {
        fechaReserva = formatearFecha(fecha);
      } catch (error) {
        return res.status(400).json({
          message: error.message
        });
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaReserva < hoy) {
        return res.status(400).json({
          message: "La fecha de la reserva no puede ser anterior a hoy"
        });
      }
    }

    // Validar horarios si se proporcionan
    if (horaInicio && horaFin && horaFin <= horaInicio) {
      return res.status(400).json({
        message: "La hora de fin debe ser posterior a la hora de inicio"
      });
    }

    // Verificar disponibilidad si se actualiza fecha, espacio u horarios
    if (fecha || espacio || horaInicio || horaFin) {
      const reservaConflictiva = await Reserva.findOne({
        _id: { $ne: id }, // Excluir la reserva actual
        espacio: espacio || reservaExistente.espacio,
        fecha: fecha ? fechaReserva : reservaExistente.fecha,
        $or: [
          { 
            horaInicio: { $lte: horaFin || reservaExistente.horaFin }, 
            horaFin: { $gte: horaInicio || reservaExistente.horaInicio } 
          }
        ]
      });

      if (reservaConflictiva) {
        return res.status(400).json({
          message: "Ya existe una reserva para este espacio en el horario seleccionado"
        });
      }
    }

    // Actualizar solo los campos proporcionados
    const camposActualizados = {};
    if (fecha) camposActualizados.fecha = fechaReserva;
    if (espacio) camposActualizados.espacio = espacio;
    if (horaInicio) camposActualizados.horaInicio = horaInicio;
    if (horaFin) camposActualizados.horaFin = horaFin;

    const reserva = await Reserva.findOneAndUpdate(
      { _id: id, usuarioId: req.user.id },
      { $set: camposActualizados },
      { new: true }
    );

    // Formatear la fecha en la respuesta
    const reservaFormateada = {
      ...reserva.toObject(),
      fecha: formatearFechaToString(reserva.fecha)
    };

    res.json({ 
      message: "Reserva actualizada correctamente", 
      reserva: reservaFormateada
    });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ 
      message: "Error al actualizar la reserva", 
      error: error.message 
    });
  }
};

export const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findOneAndDelete({ _id: id, usuarioId: req.user.id });
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    res.json({ message: "Reserva eliminada correctamente", reserva });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la reserva", error });
  }
}
// Crear una nueva reserva
export const crearReserva = async (req, res) => {
  try {
    const { fecha, espacio, horaInicio, horaFin } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!fecha || !espacio || !horaInicio || !horaFin) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
        camposFaltantes: {
          fecha: !fecha,
          espacio: !espacio,
          horaInicio: !horaInicio,
          horaFin: !horaFin,
        },
      });
    }

    // Formatear y validar la fecha
    let fechaReserva;
    try {
      fechaReserva = formatearFecha(fecha);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaReserva < hoy) {
      return res.status(400).json({
        message: "La fecha de la reserva no puede ser anterior a hoy"
      });
    }

    // Validar que horaFin sea posterior a horaInicio
    if (horaFin <= horaInicio) {
      return res.status(400).json({
        message: "La hora de fin debe ser posterior a la hora de inicio"
      });
    }

    // Verificar si ya existe una reserva para ese espacio en esa fecha y hora
    const reservaExistente = await Reserva.findOne({
      espacio,
      fecha: fechaReserva,
      $or: [
        { horaInicio: { $lte: horaFin }, horaFin: { $gte: horaInicio } }
      ]
    });

    if (reservaExistente) {
      return res.status(400).json({
        message: "Ya existe una reserva para este espacio en el horario seleccionado"
      });
    }

    // Crear la reserva
    const nuevaReserva = new Reserva({
      usuarioId: req.user.id,
      fecha: fechaReserva,
      espacio,
      horaInicio,
      horaFin,
    });

    await nuevaReserva.save();

    // Formatear la fecha en la respuesta
    const reservaFormateada = {
      ...nuevaReserva.toObject(),
      fecha: formatearFechaToString(nuevaReserva.fecha)
    };

    res.status(201).json({
      message: "Reserva creada correctamente",
      reserva: reservaFormateada,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al crear la reserva",
      error: error.message,
    });
  }
};

export  const obtenerReservasPorUsuario=async(req,res)=>{
  try {
    const reservas = await Reserva.find({ usuarioId: req.user.id });
    res.status(200).json(reservas);
  } catch (error) {
    console.log("Error al obtener las reservas",error);
    res.status(500).json({ message: "Error al obtener las reservas", error });
  }
}
