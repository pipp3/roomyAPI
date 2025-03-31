import mongoose from "mongoose";

const reservaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    sala: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    fecha: { type: Date, required: true },
    horaInicio: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          // Validar formato HH:MM
          if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(v)) return false;
          
          // Validar que la hora esté entre 9:00 y 18:00
          const [horas, minutos] = v.split(':').map(Number);
          if (horas < 9 || horas >= 18) return false;
          
          // Validar que los minutos sean múltiplos de 30
          if (minutos !== 0 && minutos !== 30) return false;
          
          return true;
        },
        message: props => 
          `${props.value} no es válido. La hora debe estar entre 9:00 y 18:00 y ser múltiplo de 30 minutos`
      }
    },
    horaFin: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          // Validar formato HH:MM
          if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(v)) return false;
          
          // Validar que la hora esté entre 9:00 y 18:00
          const [horas, minutos] = v.split(':').map(Number);
          if (horas < 9 || horas > 18) return false;
          
          // Validar que los minutos sean múltiplos de 30
          if (minutos !== 0 && minutos !== 30) return false;
          
          return true;
        },
        message: props => 
          `${props.value} no es válido. La hora debe estar entre 9:00 y 18:00 y ser múltiplo de 30 minutos`
      }
    },
  },
  { timestamps: true }
);

reservaSchema.pre("save", async function (next) {
  if (!this.isModified("fecha") && !this.isModified("horaInicio") && !this.isModified("horaFin")) {
    return next();
  }

  const fecha = new Date(this.fecha);
  const horaInicio = new Date(this.horaInicio);
  const horaFin = new Date(this.horaFin);

  if (horaInicio >= horaFin) {
    return next(new Error("La hora de inicio debe ser anterior a la hora de fin"));
  }

  const [horaInicioH, horaInicioM] = this.horaInicio.split(':').map(Number);
  const [horaFinH, horaFinM] = this.horaFin.split(':').map(Number);
  
  const duracionMinutos = (horaFinH - horaInicioH) * 60 + (horaFinM - horaInicioM);
  
  if (duracionMinutos > 180) { // 3 horas = 180 minutos
    return next(new Error('La duración máxima de una reserva es de 3 horas'));
  }
  
  if (duracionMinutos < 30) {
    return next(new Error('La duración mínima de una reserva es de 30 minutos'));
  }
  
  if (duracionMinutos % 30 !== 0) {
    return next(new Error('La duración de la reserva debe ser en intervalos de 30 minutos'));
  }

  const fechaReserva = new Date(this.fecha);
  fechaReserva.setHours(0, 0, 0, 0); // Resetear la hora a 00:00:00

  const reservaExistente = await Reserva.findOne({
    sala: this.sala,
    _id: { $ne: this._id },
    $and: [
      // Comparar la fecha exacta (mismo día)
      {
        fecha: {
          $gte: fechaReserva,
          $lt: new Date(fechaReserva.getTime() + 24 * 60 * 60 * 1000) // Siguiente día
        }
      },
      // Verificar solapamiento de horarios
      {
        $or: [
          { horaInicio: { $lt: this.horaFin }, horaFin: { $gt: this.horaInicio } }
        ]
      }
    ]
  });

  if (reservaExistente) {
    return next(new Error('Ya existe una reserva para este horario'));
  }

  next();
});


const Reserva = mongoose.model("Reserva", reservaSchema);

export default Reserva;
