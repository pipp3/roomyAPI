import mongoose from 'mongoose';

const reservaSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    espacio: { type: String, required: true },
    fecha: { type: Date, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true }
}, { timestamps: true });

const Reserva = mongoose.model('Reserva', reservaSchema);

export default Reserva;