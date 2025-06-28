import Reserva from "../models/Reserva.js";
import Usuario from "../models/Usuario.js";
import mongoose from "mongoose";
import { formatearFecha, formatearFechaToString } from "../utils/dateUtils.js";

// Obtener todas las reservas
export const obtenerReservas = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "userId es requerido" });
    }
    
    const reservas = await Reserva.find({
      usuarioId: new mongoose.Types.ObjectId(userId),
    });
    // Formatear las fechas en la respuesta
    const reservasFormateadas = reservas.map((reserva) => ({
      ...reserva.toObject(),
      fecha: formatearFechaToString(reserva.fecha),
    }));
    res.json(reservasFormateadas);
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({ message: error.message });
  }
};

export const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, sala, horaInicio, horaFin, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId es requerido" });
    }

    // Buscar la reserva existente
    const reservaExistente = await Reserva.findOne({
      _id: id,
      usuarioId: new mongoose.Types.ObjectId(userId),
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
          message: error.message,
        });
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaReserva < hoy) {
        return res.status(400).json({
          message: "La fecha de la reserva no puede ser anterior a hoy",
        });
      }
    }

    // Validar horarios si se proporcionan
    if (horaInicio && horaFin && horaFin <= horaInicio) {
      return res.status(400).json({
        message: "La hora de fin debe ser posterior a la hora de inicio",
      });
    }

    // Verificar disponibilidad si se actualiza fecha, sala u horarios
    if (fecha || sala || horaInicio || horaFin) {
      const reservaConflictiva = await Reserva.findOne({
        _id: { $ne: id }, // Excluir la reserva actual
        sala: sala || reservaExistente.sala,
        fecha: fecha ? fechaReserva : reservaExistente.fecha,
        $or: [
          {
            horaInicio: { $lte: horaFin || reservaExistente.horaFin },
            horaFin: { $gte: horaInicio || reservaExistente.horaInicio },
          },
        ],
      });

      if (reservaConflictiva) {
        return res.status(400).json({
          message:
            "Ya existe una reserva para esta sala en el horario seleccionado",
        });
      }
    }

    // Actualizar solo los campos proporcionados
    const camposActualizados = {};
    if (fecha) camposActualizados.fecha = fechaReserva;
    if (sala) camposActualizados.sala = sala;
    if (horaInicio) camposActualizados.horaInicio = horaInicio;
    if (horaFin) camposActualizados.horaFin = horaFin;

    const reserva = await Reserva.findOneAndUpdate(
      { _id: id, usuarioId: new mongoose.Types.ObjectId(userId) },
      { $set: camposActualizados },
      { new: true }
    );

    // Formatear la fecha en la respuesta
    const reservaFormateada = {
      ...reserva.toObject(),
      fecha: formatearFechaToString(reserva.fecha),
    };

    res.json({
      message: "Reserva actualizada correctamente",
      reserva: reservaFormateada,
    });
  } catch (error) {
    console.error("Error al actualizar reserva:", error);
    res.status(500).json({
      message: "Error al actualizar la reserva",
      error: error.message,
    });
  }
};

export const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId es requerido" });
    }

    const reserva = await Reserva.findOneAndDelete({
      _id: id,
      usuarioId: new mongoose.Types.ObjectId(userId),
    });
    
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    res.json({ message: "Reserva eliminada correctamente", reserva });
  } catch (error) {
    console.error("Error al eliminar la reserva:", error);
    res.status(500).json({ message: "Error al eliminar la reserva", error: error.message });
  }
};

// Crear una nueva reserva
export const crearReserva = async (req, res) => {
  try {
    console.log("Body recibido:", req.body);
    const { fecha, sala, horaInicio, horaFin, userId } = req.body;
    console.log("Datos extraídos:", { fecha, sala, horaInicio, horaFin, userId });

    // Validar que todos los campos requeridos estén presentes
    if (!fecha || !sala || !horaInicio || !horaFin || !userId) {
      console.log("Campos faltantes:", {
        fecha: !fecha,
        sala: !sala,
        horaInicio: !horaInicio,
        horaFin: !horaFin,
        userId: !userId,
      });
      return res.status(400).json({
        message: "Todos los campos son requeridos",
        camposFaltantes: {
          fecha: !fecha,
          sala: !sala,
          horaInicio: !horaInicio,
          horaFin: !horaFin,
          userId: !userId,
        },
      });
    }

    // Formatear y validar la fecha
    let fechaReserva;
    try {
      fechaReserva = formatearFecha(fecha);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaReserva < hoy) {
      return res.status(400).json({
        message: "La fecha de la reserva no puede ser anterior a hoy",
      });
    }

    // Validar que horaFin sea posterior a horaInicio
    if (horaFin <= horaInicio) {
      return res.status(400).json({
        message: "La hora de fin debe ser posterior a la hora de inicio",
      });
    }

    // Verificar si ya existe una reserva para ese espacio en esa fecha y hora
    const reservaExistente = await Reserva.findOne({
      sala,
      fecha: fechaReserva,
      $or: [{ horaInicio: { $lte: horaFin }, horaFin: { $gte: horaInicio } }],
    });

    if (reservaExistente) {
      return res.status(400).json({
        message:
          "Ya existe una reserva para este espacio en el horario seleccionado",
      });
    }

    // Crear la reserva
    const nuevaReserva = new Reserva({
      usuarioId: new mongoose.Types.ObjectId(userId),
      fecha: fechaReserva,
      sala,
      horaInicio,
      horaFin,
    });

    await nuevaReserva.save();

    // Formatear la fecha en la respuesta
    const reservaFormateada = {
      ...nuevaReserva.toObject(),
      fecha: formatearFechaToString(nuevaReserva.fecha),
    };

    res.status(201).json({
      message: "Reserva creada correctamente",
      reserva: reservaFormateada,
    });
  } catch (error) {
    console.error("Error al crear la reserva:", error);
    res.status(400).json({
      message: "Error al crear la reserva",
      error: error.message,
    });
  }
};

export const obtenerReservasPorUsuario = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "userId es requerido" });
    }
    
    const reservas = await Reserva.find({ usuarioId: new mongoose.Types.ObjectId(userId) });
    
    // Formatear las fechas en la respuesta
    const reservasFormateadas = reservas.map((reserva) => ({
      ...reserva.toObject(),
      fecha: formatearFechaToString(reserva.fecha),
    }));
    
    res.status(200).json(reservasFormateadas);
  } catch (error) {
    console.error("Error al obtener las reservas:", error);
    res.status(500).json({ message: "Error al obtener las reservas", error: error.message });
  }
};

export const obtenerDisponibilidadSala = async (req, res) => {
  try {
    const { sala, fecha } = req.query;

    // Validar que se proporcionen los parámetros necesarios
    if (!sala || !fecha) {
      return res.status(400).json({
        message: "Se requiere especificar la sala y la fecha",
        camposFaltantes: {
          sala: !sala,
          fecha: !fecha,
        },
      });
    }

    // Validar que la sala sea válida
    const salasValidas = [
      "Sala1",
      "Sala2",
      "Sala3",
      "Sala4",
      "Sala5",
      "Sala6",
      "Sala7",
      "Sala8",
      "Sala9",
      "Sala10",
    ];

    if (!salasValidas.includes(sala)) {
      return res.status(400).json({
        message: "Sala no válida",
        salasDisponibles: salasValidas,
      });
    }

    // Formatear y validar la fecha
    let fechaReserva;
    try {
      fechaReserva = formatearFecha(fecha);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Obtener todas las reservas para la sala en la fecha especificada
    const reservas = await Reserva.find({
      sala,
      fecha: fechaReserva,
    });

    // Generar horarios disponibles (cada 30 minutos desde 9:00 hasta 18:00)
    const horariosDisponibles = [];
    const horariosOcupados = reservas.map((reserva) => ({
      inicio: reserva.horaInicio,
      fin: reserva.horaFin,
    }));

    for (let hora = 9; hora < 18; hora++) {
      for (let minutos = 0; minutos < 60; minutos += 30) {
        const horaActual = `${hora.toString().padStart(2, "0")}:${minutos
          .toString()
          .padStart(2, "0")}`;

        // Verificar si el horario está ocupado
        const estaOcupado = horariosOcupados.some((ocupado) => {
          return horaActual >= ocupado.inicio && horaActual < ocupado.fin;
        });

        if (!estaOcupado) {
          horariosDisponibles.push(horaActual);
        }
      }
    }

    res.json({
      sala,
      fecha: formatearFechaToString(fechaReserva),
      horariosDisponibles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la disponibilidad",
      error: error.message,
    });
  }
};

// Obtener o crear usuario basado en datos de NextAuth
export const obtenerOCrearUsuario = async (req, res) => {
  try {
    const { googleId, email, nombre, avatar } = req.query;
    
    if (!googleId || !email || !nombre) {
      return res.status(400).json({ 
        message: "googleId, email y nombre son requeridos",
        received: { googleId, email, nombre, avatar }
      });
    }
    
    // Buscar usuario existente por googleId
    let usuario = await Usuario.findOne({ googleId });
    
    if (!usuario) {
      // Crear nuevo usuario
      console.log('Creando nuevo usuario con datos:', { googleId, email, nombre, avatar });
      usuario = await Usuario.create({
        googleId,
        email,
        nombre,
        avatar: avatar || null
      });
      console.log('Usuario creado:', usuario);
    } else {
      // Actualizar datos del usuario si es necesario
      let needsUpdate = false;
      
      if (usuario.email !== email) {
        usuario.email = email;
        needsUpdate = true;
      }
      
      if (usuario.nombre !== nombre) {
        usuario.nombre = nombre;
        needsUpdate = true;
      }
      
      if (avatar && usuario.avatar !== avatar) {
        usuario.avatar = avatar;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await usuario.save();
        console.log('Usuario actualizado:', usuario);
      }
    }
    
    res.json({
      userId: usuario._id,
      googleId: usuario.googleId,
      email: usuario.email,
      nombre: usuario.nombre,
      avatar: usuario.avatar
    });
    
  } catch (error) {
    console.error("Error al obtener/crear usuario:", error);
    res.status(500).json({
      message: "Error al obtener/crear usuario",
      error: error.message,
    });
  }
};
