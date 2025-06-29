import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    avatar: { type: String } // URL de la imagen de perfil de Google
}, { timestamps: true });

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario; 