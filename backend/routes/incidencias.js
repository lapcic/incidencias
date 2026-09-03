const fs = require('fs');
const path = require('path');

module.exports = function registrarCorteMensual(app, db) {
  app.post('/api/corte-mensual', async (req, res) => {
    try {
      // Usamos la vista 'vista_incidencias' o la tabla 'incidencias' según prefieras
      // La vista ya incluye los datos del empleado unidos.
      const [incidencias] = await db.query("SELECT * FROM incidencias");

      console.log("Incidencias encontradas para respaldo:", incidencias); // Esto saldrá en tu terminal de Node.js

      if (!incidencias || incidencias.length === 0) {
        return res.status(200).json({ mensaje: "No hay incidencias para respaldar." });
      }

      const fechaActual = new Date().toISOString().slice(0, 7); // Formato YYYY-MM
      const carpetaRespaldo = path.join(__dirname, '../../cortes_mensuales', fechaActual);

      if (!fs.existsSync(carpetaRespaldo)) {
        fs.mkdirSync(carpetaRespaldo, { recursive: true });
      }

      // Agrupar por id_empleado
      const porUsuario = incidencias.reduce((acc, inc) => {
        acc[inc.id_empleado] = acc[inc.id_empleado] || [];
        acc[inc.id_empleado].push(inc);
        return acc;
      }, {});

      for (const [idUsuario, lista] of Object.entries(porUsuario)) {
        const rutaArchivo = path.join(carpetaRespaldo, `usuario_${idUsuario}_incidencias.json`);
        fs.writeFileSync(rutaArchivo, JSON.stringify(lista, null, 2));
      }

      // Borrar las incidencias de la base de datos tras respaldarlas con éxito
      await db.query("DELETE FROM incidencias");

      res.status(200).json({ 
        exito: true, 
        mensaje: `Corte mensual generado con éxito. Se respaldaron ${incidencias.length} incidencias y se limpió la base de datos.` 
      });

    } catch (error) {
      console.error("Error detallado en el corte mensual:", error);
      res.status(500).json({ error: "Hubo un error al realizar el corte mensual." });
    }
  });
};
