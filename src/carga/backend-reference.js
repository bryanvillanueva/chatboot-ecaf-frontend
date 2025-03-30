/**
 * Este archivo es solo una referencia para implementar el backend.
 * No es parte del frontend, pero muestra cómo podría ser la implementación
 * del lado del servidor para procesar los archivos Excel.
 */

/**
 * Ejemplo de controlador de Express para procesar estudiantes
 */
const procesarEstudiantes = async (req, res) => {
  try {
    // Verificar que se envió un archivo
    if (!req.files || !req.files.excel_file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se ha enviado ningún archivo' 
      });
    }
    
    const file = req.files.excel_file;
    const workbook = XLSX.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    // Variables para controlar el proceso
    let processed = 0;
    let errors = 0;
    let errorDetails = [];
    
    // Procesar cada fila
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Validar datos requeridos
        if (!row.tipo_documento || !row.numero_documento || 
            !row.nombres || !row.apellidos || !row.email) {
          throw new Error(`Fila ${i+2}: Faltan campos requeridos`);
        }
        
        // Llamar al procedimiento almacenado
        await connection.query('CALL registrar_estudiante(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @id)', [
          row.tipo_documento,
          row.numero_documento,
          row.nombres,
          row.apellidos,
          row.fecha_nacimiento || null,
          row.genero || null,
          row.email,
          row.telefono || null,
          row.direccion || null,
          row.ciudad || null
        ]);
        
        processed++;
      } catch (err) {
        errors++;
        errorDetails.push(`Fila ${i+2}: ${err.message}`);
      }
    }
    
    return res.json({
      success: true,
      message: `Proceso completado con ${processed} estudiantes registrados y ${errors} errores`,
      processed,
      errors,
      details: errorDetails.join('\n')
    });
    
  } catch (error) {
    console.error('Error al procesar archivo de estudiantes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el archivo',
      error: error.message
    });
  }
};

/**
 * Ejemplo de controlador de Express para procesar notas
 */
const procesarNotas = async (req, res) => {
  try {
    // Verificar que se envió un archivo
    if (!req.files || !req.files.excel_file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se ha enviado ningún archivo' 
      });
    }
    
    const file = req.files.excel_file;
    const workbook = XLSX.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    // Variables para controlar el proceso
    let processed = 0;
    let errors = 0;
    let errorDetails = [];
    
    // Procesar cada fila
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Validar datos requeridos
        if (!row.tipo_documento || !row.numero_documento || 
            !row.nombre_programa || !row.tipo_programa || 
            !row.materia || !row.periodo) {
          throw new Error(`Fila ${i+2}: Faltan campos requeridos`);
        }
        
        // Llamar al procedimiento almacenado
        await connection.query('CALL cargar_notas_programa(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          row.tipo_documento,
          row.numero_documento,
          row.nombre_programa,
          row.tipo_programa,
          row.estado_programa || 'En curso',
          row.materia,
          row.descripcion_materia || null,
          row.nota || null,
          row.periodo
        ]);
        
        processed++;
      } catch (err) {
        errors++;
        errorDetails.push(`Fila ${i+2}: ${err.message}`);
      }
    }
    
    return res.json({
      success: true,
      message: `Proceso completado con ${processed} registros procesados y ${errors} errores`,
      processed,
      errors,
      details: errorDetails.join('\n')
    });
    
  } catch (error) {
    console.error('Error al procesar archivo de notas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el archivo',
      error: error.message
    });
  }
};

/**
 * Ejemplo de rutas de Express para el módulo de carga
 */
// router.post('/api/carga/estudiantes', procesarEstudiantes);
// router.post('/api/carga/notas', procesarNotas);
// router.get('/api/carga/plantillas/:tipo', (req, res) => {
//   const tipo = req.params.tipo;
//   const rutaPlantilla = path.join(__dirname, `../plantillas/Plantilla_${tipo}.xlsx`);
//   res.download(rutaPlantilla);
// });
