const adminService = require('../services/adminService');

/**
 * Elimina una palabra por su ID
 */
const eliminarPalabra = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Se requiere un ID válido' });
        }

        await adminService.eliminarPalabra(parseInt(id));

        res.json({ mensaje: `Palabra con ID ${id} eliminada correctamente` });
    } catch (error) {
        console.error('Error al eliminar palabra:', error);

        if (error.message.includes('No se pudo eliminar')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Error al eliminar la palabra' });
    }
};

/**
 * Actualiza una palabra existente
 */
const actualizarPalabra = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Se requiere un ID válido' });
        }

        if (!datos || Object.keys(datos).length === 0) {
            return res.status(400).json({ error: 'Se requieren datos para actualizar' });
        }

        // Si se está actualizando la palabra, procesarla con el servicio de palabras
        if (datos.palabra) {
            // Importamos el servicio de palabras
            const palabrasService = require('../services/palabrasService');
            const alfabetoPalabras = require('../helpers/Alfabeto');

            // Generar la representación en asteriscos
            const letras = datos.palabra.toUpperCase().split('');
            const lineas = [];
            const maxLineas = 7;

            // Inicializa el array de líneas vacías
            for (let i = 0; i < maxLineas; i++) {
                lineas[i] = '';
            }

            // Por cada letra, agregamos cada línea a su fila correspondiente
            letras.forEach(letra => {
                const arte = alfabetoPalabras[letra] || [""];

                for (let i = 0; i < maxLineas; i++) {
                    lineas[i] += (arte[i] || '       ') + '  '; // si no hay línea, rellena con espacios
                }
            });

            // Unir las líneas en una representación completa
            const representacion = lineas.join('\n');

            // Actualizar la palabra y su representación en la base de datos
            await adminService.actualizarPalabra(parseInt(id), {
                palabra: datos.palabra,
                representacion: representacion
            });

            // Obtener la palabra actualizada
            const palabraActualizada = await adminService.actualizarPalabra(parseInt(id), {});

            // Mostrar en consola la representación
            console.log('\n' + representacion + '\n');

            // Devolver respuesta similar a POST
            return res.json({
                id: palabraActualizada.id,
                palabra: palabraActualizada.palabra,
                resultado: representacion,
                contador_uso: palabraActualizada.contador_uso
            });
        } else {
            // Si no se está actualizando la palabra, usar el flujo normal
            const palabraActualizada = await adminService.actualizarPalabra(parseInt(id), datos);
            res.json(palabraActualizada);
        }
    } catch (error) {
        console.error('Error al actualizar palabra:', error);

        if (error.message.includes('No se encontró')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Error al actualizar la palabra' });
    }
};

/**
 * Obtiene estadísticas de uso
 */
const obtenerEstadisticas = async (req, res) => {
    try {
        const estadisticas = await adminService.obtenerEstadisticas();

        res.json(estadisticas);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};

module.exports = {
    eliminarPalabra,
    actualizarPalabra,
    obtenerEstadisticas
};