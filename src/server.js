import app from './app.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en ${HOST}:${PORT}`);
    console.log(`Documentación disponible en http://${HOST}:${PORT}/api-docs`);
    if (process.env.NODE_ENV === 'production' && process.env.VPS_IP) {
        console.log(`API accesible desde: http://${process.env.VPS_IP}:${PORT}`);
        console.log(`Documentación externa: http://${process.env.VPS_IP}:${PORT}/api-docs`);
    }
});