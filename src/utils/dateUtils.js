/**
 * Convierte una fecha del formato dd/mm/aaaa a un objeto Date
 * @param {string} fecha - Fecha en formato dd/mm/aaaa
 * @returns {Date} Objeto Date
 * @throws {Error} Si el formato de fecha es inválido
 */
export const formatearFecha = (fecha) => {
    // Validar el formato dd/mm/aaaa
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = fecha.match(regex);

    if (!match) {
        throw new Error('Formato de fecha inválido. Use el formato dd/mm/aaaa');
    }

    const [, dia, mes, año] = match;
    
    // Crear objeto Date (mes es 0-based, por eso restamos 1)
    const fechaObj = new Date(año, mes - 1, dia);

    // Validar que la fecha sea válida
    if (fechaObj.getDate() != dia || 
        fechaObj.getMonth() + 1 != mes || 
        fechaObj.getFullYear() != año) {
        throw new Error('Fecha inválida');
    }

    return fechaObj;
};

/**
 * Formatea una fecha a string en formato dd/mm/aaaa
 * @param {Date} fecha - Objeto Date
 * @returns {string} Fecha formateada
 */
export const formatearFechaToString = (fecha) => {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
}; 