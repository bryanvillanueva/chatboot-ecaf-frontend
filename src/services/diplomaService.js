import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Inicializar pdfMake con las fuentes virtuales y configurar fuentes estándar
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

// Usar solo las fuentes que vienen por defecto con pdfMake
pdfMake.fonts = {
  // Roboto está disponible por defecto
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  // Helvetica está disponible como fuente estándar
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

// Información institucional real de ECAF
const ECAF_INFO = {
  nombre: "ECAF",
  nombreCompleto: "Escuela de Capacitación de Acondicionamiento Físico - ECAF",
  nit: "900185064-1",
  direccion: "Cra 47 #63-08",
  telefono: "+57 304 600 09 06",
  email: "info@ecafescuela.com",
  emailContacto: "contacto@ecafescuela.com", 
  web: "ecafescuela.com",
  ciudad: "Barranquilla, Atlántico",
  pais: "Colombia"
};

// Función para convertir imagen a base64 (IGUAL QUE LOS OTROS SERVICIOS)
const convertImageToBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;
        ctx.drawImage(this, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        console.log(`✅ Imagen convertida correctamente: ${imagePath}, tamaño: ${this.naturalWidth}x${this.naturalHeight}`);
        console.log(`📝 Base64 preview: ${dataURL.substring(0, 50)}...`);
        resolve(dataURL);
      } catch (error) {
        console.error('❌ Error al convertir imagen:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error(`❌ Error al cargar imagen desde: ${imagePath}`, error);
      // Intentar con diferentes rutas
      const alternativePaths = [
        `${window.location.origin}${imagePath}`,
        `${process.env.PUBLIC_URL}${imagePath}`,
        imagePath.replace('/img/', '/public/img/'),
        imagePath.replace('/img/', './img/')
      ];
      
      console.log('🔄 Intentando rutas alternativas:', alternativePaths);
      tryAlternativePaths(alternativePaths, 0, resolve, reject);
    };
    
    console.log(`🔍 Cargando imagen desde: ${imagePath}`);
    console.log(`🌐 URL completa: ${window.location.origin}${imagePath}`);
    img.src = imagePath;
  });
};

// Función auxiliar para probar rutas alternativas (IGUAL QUE LOS OTROS SERVICIOS)
const tryAlternativePaths = (paths, index, resolve, reject) => {
  if (index >= paths.length) {
    reject(new Error('No se pudo cargar la imagen desde ninguna ruta'));
    return;
  }
  
  const img = new Image();
  const currentPath = paths[index];
  
  img.onload = function() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      console.log(`✅ Imagen cargada desde ruta alternativa: ${currentPath}`);
      resolve(dataURL);
    } catch (error) {
      console.error('❌ Error al convertir imagen alternativa:', error);
      tryAlternativePaths(paths, index + 1, resolve, reject);
    }
  };
  
  img.onerror = () => {
    console.log(`❌ Falló ruta: ${currentPath}`);
    tryAlternativePaths(paths, index + 1, resolve, reject);
  };
  
  console.log(`🔄 Probando: ${currentPath}`);
  img.src = currentPath;
};

// Función para obtener la fecha actual en formato legible
const getCurrentFormattedDate = () => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('es-ES', options);
};

// Función para formatear fecha de grado
const formatearFechaGrado = (fecha) => {
  if (!fecha) return getCurrentFormattedDate();
  const fechaObj = new Date(fecha);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return fechaObj.toLocaleDateString('es-ES', options);
};

// Plantilla para diploma - FORMATO HORIZONTAL FORZADO
const createDiplomaTemplate = async (data) => {
  let fondoCompletoBase64 = null;
  let fondoSinLogosBase64 = null;
  let logoECAFBase64 = null;
  let escudoColombiaBase64 = null;
  let firmaDirectorBase64 = null;
  let firmaCoordinadoraBase64 = null;
  
  try {
    console.log('🖼️ Iniciando carga de imágenes de fondo...');
    
    // PRIMERO: Intentar cargar fondos
    try {
      fondoCompletoBase64 = await convertImageToBase64('/img/fondo-diploma-completo.png');
      console.log('✅ Fondo completo cargado correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el fondo completo:', error.message);
    }
    
    try {
      fondoSinLogosBase64 = await convertImageToBase64('/img/fondo-diploma-simple.png');
      console.log('✅ Fondo simple cargado correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el fondo simple:', error.message);
    }
    
    // SEGUNDO: SIEMPRE cargar elementos individuales (logos y firmas)
    console.log('🔄 Cargando elementos individuales (logos y firmas)...');
    
    try {
      logoECAFBase64 = await convertImageToBase64('/img/logo.png');
      console.log('✅ Logo ECAF cargado correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el logo ECAF:', error.message);
    }
    
    try {
      escudoColombiaBase64 = await convertImageToBase64('/img/escudo-colombia.png');
      console.log('✅ Escudo de Colombia cargado correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el escudo de Colombia:', error.message);
    }
    
    // FIRMAS INDIVIDUALES ESPECÍFICAS DEL DIPLOMA - ÚNICAMENTE ESTAS
    try {
      firmaDirectorBase64 = await convertImageToBase64('/img/firma-director.png');
      console.log('✅ Firma del director cargada correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar la firma del director:', error.message);
    }
    
    try {
      firmaCoordinadoraBase64 = await convertImageToBase64('/img/firma-coordinadora.png');
      console.log('✅ Firma de la coordinadora cargada correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar la firma de la coordinadora:', error.message);
    }
    
  } catch (error) {
    console.warn('⚠️ Error general al cargar imágenes:', error);
  }

  // Decidir qué fondo usar
  const fondoSeleccionado = fondoCompletoBase64 || fondoSinLogosBase64;
  const tieneElementosIndividuales = logoECAFBase64 || escudoColombiaBase64;

  console.log('🎯 Configuración final:');
  console.log('   - Fondo completo:', fondoCompletoBase64 ? 'SÍ' : 'NO');
  console.log('   - Fondo simple:', fondoSinLogosBase64 ? 'SÍ' : 'NO');
  console.log('   - Logo ECAF:', logoECAFBase64 ? 'SÍ' : 'NO');
  console.log('   - Escudo Colombia:', escudoColombiaBase64 ? 'SÍ' : 'NO');
  console.log('   - Firma Director:', firmaDirectorBase64 ? 'SÍ' : 'NO');
  console.log('   - Firma Coordinadora:', firmaCoordinadoraBase64 ? 'SÍ' : 'NO');
  console.log('📐 Configuración PDF:');
  console.log('   - Tamaño: 922x639 (326×226 mm - tamaño original)');
  console.log('   - Orientación: landscape');
  console.log('   - Fuente: Roboto');
  console.log('   - Fondo seleccionado:', fondoSeleccionado ? 'SÍ' : 'NO');

  return {
    pageSize: { width: 922, height: 639 }, // TAMAÑO ORIGINAL: 326×226 mm convertido a puntos
    pageOrientation: 'landscape', // ORIENTACIÓN EXPLÍCITA
    landscape: true, // REDUNDANTE PERO NECESARIO
    pageMargins: [30, 30, 30, 30], // MÁRGENES MÁS PEQUEÑOS PARA EL NUEVO TAMAÑO
    
    // BACKGROUND: Usar imagen de fondo si existe
    background: fondoSeleccionado ? {
      image: fondoSeleccionado,
      width: 922, // TODA LA PÁGINA - nuevo tamaño
      height: 639, // TODA LA PÁGINA - nuevo tamaño  
      absolutePosition: { x: 0, y: 0 }, // DESDE ESQUINA SUPERIOR IZQUIERDA
      cover: { width: 922, height: 639 } // FORZAR COBERTURA TOTAL
    } : logoECAFBase64 ? {
      // Marca de agua si solo tenemos logo individual
      image: logoECAFBase64,
      width: 400,
      opacity: 0.08,
      alignment: 'center',
      margin: [0, 150, 0, 0]
    } : null,
    
    content: [
      // HEADER PRINCIPAL - SIEMPRE MOSTRAR (incluso con fondo)
      {
        columns: [
          // Espacio para escudo (si no hay fondo, se muestra; si hay fondo, solo espacio)
          {
            width: 80,
            text: '', // Solo espacio para alineación
            height: 50
          },
          
          // Título central - SIEMPRE VISIBLE
          {
            width: '*',
            stack: [
              {
                text: [
                  { text: 'ESCUELA DE CAPACITACIÓN PARA EL ACONDICIONAMIENTO FÍSICO', style: 'mainTitleBold' },
                  { text: '\n"ECAF"', style: 'ecafTitleBold' }
                ],
                alignment: 'center',
                margin: [0, 8, 0, 3]
              },
              {
                text: 'Institución de Educación Para el Trabajo y el Desarrollo Humano',
                style: 'subtitleBold',
                alignment: 'center',
                margin: [0, 0, 0, 2]
              },
              {
                text: [
              
                  { text: 'Aprobado por la Secretaría de Educación Distrital de Barranquilla Mediante Resolución No 001356 de 2006'},
                  {text: '\ny con Personería Jurídica No.00194 de 2007 emanada por la Gobernación del Atlántico.'	}
                ],
                style: 'resolutionBold',
                alignment: 'center',
                margin: [0, 0, 0, 0]
              }
            ]
          },
          
          // Espacio para logo (si no hay fondo, se muestra; si hay fondo, solo espacio)
          {
            width: 80,
            text: '', // Solo espacio para alineación
            height: 50
          }
        ],
        margin: [0, 15, 0, 8] // REDUCIR MARGEN INFERIOR (era 20)
      },
      
      // "Certifica que" - centrado y en cursiva
      {
        text: 'Certifica qué',
        style: 'certificaQueBold',
        alignment: 'center',
        margin: [0, 5, 0, 8] // REDUCIR MÁRGENES (era 10, 15)
      },
      
      // NOMBRE DEL ESTUDIANTE - grande, cursiva y destacado
      {
        text: `${data.diploma.nombre} ${data.diploma.apellido}`.toUpperCase(),
        style: 'studentNameItalic',
        alignment: 'center',
        margin: [0, 0, 0, -7] // REDUCIR MARGEN INFERIOR (era 8)
      },
      
      // LÍNEA AMARILLA bajo el nombre
      {
        canvas: [
          {
            type: 'line',
            x1: 140, y1: 0,
            x2: 700, y2: 0, // AJUSTAR AL NUEVO ANCHO
            lineWidth: 1,
            lineColor: '#E0B933' // COLOR AMARILLO ESPECIFICADO
          }
        ],
        margin: [0, 0, 0, 8] // REDUCIR MARGEN INFERIOR (era 12)
      },
      
      // NÚMERO DE IDENTIFICACIÓN
      {
        text: `Con ${data.diploma.tipo_identificacion} ${data.diploma.numero_identificacion}`,
        style: 'identificationBold',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      
      // TEXTO PRINCIPAL DEL CERTIFICADO
      {
        text: 'Asistió y aprobó el diplomado de:',
        style: 'mainTextBold',
        alignment: 'center',
        margin: [0, 0, 0, 1]
      },
      
      // NOMBRE DEL PROGRAMA/DIPLOMADO
      {
        text: (data.diploma.nombre_tipo_diploma || data.diploma.tipo_diploma || 'PERSONAL TRAINER').toUpperCase(),
        style: 'programTitleBold',
        alignment: 'center',
        margin: [0, 0, 0, 1]
      },
      
      // MODALIDAD
      {
        text: `(${(data.diploma.modalidad || 'PRESENCIAL').toUpperCase()})`,
        style: 'modalityBold',
        alignment: 'center',
        margin: [0, 0, 0, 12]
      },
      
      // TEXTO DE CUMPLIMIENTO
      {
        text: [
        {text: 'Cumpliendo satisfactoriamente los requisitos académicos y reglamentarios correspondiente al plan de estudio '},
        {text: '\n establecido por esta institución'}
      ],
        style: 'complianceTextBold',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      
      // FECHA Y LUGAR DE EXPEDICIÓN
      {
        text: `Para su constancia se firma en la ciudad de ${ECAF_INFO.ciudad} el día ${formatearFechaGrado(data.diploma.fecha_grado)}`,
        style: 'expeditionTextBold',
        alignment: 'center',
        margin: [0, 0, 0, 10] // REDUCIR MARGEN (era 20)
      },
      
      // SECCIÓN DE FIRMAS - IMÁGENES SOBRE TEXTO
      {
        columns: [
          // Firma del Director
          {
            width: '*',
            stack: [
              // Imagen de firma (si existe)
              firmaDirectorBase64 ? {
                image: firmaDirectorBase64,
                width: 120,
                height: 40,
                alignment: 'center',
                margin: [0, 0, 0, -18] // Sin margen para que esté pegada al texto
              } : null,
              // Línea de texto SIEMPRE visible
              {
                text: '________________________',
                alignment: 'center',
                margin: [0, 0, 0, 0] // Margen pequeño
              },
              {
                text: 'Director',
                style: 'signatureTitleBold',
                alignment: 'center'
              }
            ].filter(Boolean) // Filtrar elementos null
          },
          
          // Firma de la Coordinadora Académica
          {
            width: '*',
            stack: [
              // Imagen de firma (si existe)
              firmaCoordinadoraBase64 ? {
                image: firmaCoordinadoraBase64,
                width: 120,
                height: 40,
                alignment: 'center',
                margin: [0, 0, 0, -24] // Sin margen para que esté pegada al texto
              } : null,
              // Línea de texto SIEMPRE visible
              {
                text: '________________________',
                alignment: 'center',
                margin: [0, 5, 0, 5] // Margen pequeño
              },
              {
                text: 'Coordinadora Académica',
                style: 'signatureTitleBold',
                alignment: 'center'
              }
            ].filter(Boolean) // Filtrar elementos null
          }
        ],
        margin: [80, 0, 80, 5] // REDUCIR MARGEN INFERIOR (era 20)
      },
      
      // INFORMACIÓN FINAL (Barranquilla, Libro, Acta)
      {
        columns: [
          { width: '*', text: '' },          // espaciador izquierdo (opcional)
          {
            width: 'auto',
            columns: [
              // Ciudad + fecha
              {
                text: `${ECAF_INFO.ciudad}, ${formatearFechaGrado(data.diploma.fecha_grado)}`,
                style: 'footerInfoBold',
                alignment: 'center',
                margin: [0, 0, 180, 0]
              },
      
              // ► «Libro …  Acta …» JUNTOS
              {
                width: 'auto',
                text: [
                  { text: `Libro No. ${data.diploma.libro || '___'}`, style: 'footerInfoBold' },
                  { text: '   ' },   // separación con espacios finos
                  { text: `Acta No. ${data.diploma.acta || '___'}`,  style: 'footerInfoBold' }
                ],
                alignment: 'center',
                margin: [0, 0, 50, 0]
              }
            ],
            columnGap: 8          // separa ciudad-fecha del bloque Libro-Acta
          },
          { width: '*', text: '' }           // espaciador derecho (opcional)
        ]
      }
      
    ],
    
    styles: {
      // TODOS LOS ESTILOS CON TIMES NEW ROMAN Y NEGRITA
      mainTitleBold: {
        fontSize: 16,
        bold: true,
        color: '#333333',
        italics: true,  
      },
      ecafTitleBold: {
        fontSize: 32,
        bold: true,
        color: '#333333'
      },
      subtitleBold: {
        fontSize: 12,
        bold: true, // CAMBIAR A BOLD
        color: '#333333',
        italics: true,
      },
      resolutionBold: {
        fontSize: 9,
        bold: true, // CAMBIAR A BOLD
        color: '#333333',
        italics: true,
      },
      certificaQueBold: {
        fontSize: 12,
        bold: true, // CAMBIAR A BOLD
        color: '#333333',
        italics: true,
      },
      studentNameItalic: {
        fontSize: 32,
        italics: true, // CURSIVA PARA EL NOMBRE
    
        color: '#333333',
      },
      identificationBold: {
        fontSize: 10,
        bold: true, // CAMBIAR A BOLD
        color: '#333333'
      },
      mainTextBold: {
        fontSize: 10,
        bold: true, // CAMBIAR A BOLD
        color: '#333333'
      },
      programTitleBold: {
        fontSize: 24,
        bold: true,
        color: '#333333'
      },
      modalityBold: {
        fontSize: 14,
        bold: true,
        color: '#333333'
      },
      complianceTextBold: {
        fontSize: 11,
        bold: true, // CAMBIAR A BOLD
        color: '#333333',
        lineHeight: 1.3,
        italics: true,
        
      },
      expeditionTextBold: {
        fontSize: 11,
        bold: true, // CAMBIAR A BOLD
        color: '#333333',
        italics: true,
      },
      signatureTitleBold: {
        fontSize: 11,
        bold: true,
        color: '#333333'
      },
      footerInfoBold: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      }
    },
    
    defaultStyle: {
      font: 'Roboto', // USAR ROBOTO COMO FUENTE PRINCIPAL (funciona mejor)
      lineHeight: 1.2
    }
  };
};

// Función para cargar datos reales de la base de datos (IGUAL QUE LOS OTROS SERVICIOS)
const cargarDatosRealesDiploma = async (diploma) => {
  try {
    console.log('🔄 Cargando datos del diploma:', diploma);
    
    const response = await fetch(
      `https://webhook-ecaf-production.up.railway.app/api/diplomas/${diploma.id}/datos-diploma`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron obtener los datos del diploma`);
    }
    
    const data = await response.json();
    console.log('✅ Datos del diploma obtenidos:', data);

    return {
      diploma: {
        id: data.diploma?.id || diploma.id,
        nombre: data.diploma?.nombre || diploma.nombre,
        apellido: data.diploma?.apellido || diploma.apellido,
        tipo_identificacion: data.diploma?.tipo_identificacion || diploma.tipo_identificacion,
        numero_identificacion: data.diploma?.numero_identificacion || diploma.numero_identificacion,
        tipo_diploma: data.diploma?.tipo_diploma || diploma.tipo_diploma,
        nombre_tipo_diploma: data.diploma?.nombre_tipo_diploma || diploma.nombre_tipo_diploma,
        modalidad: data.diploma?.modalidad || diploma.modalidad,
        fecha_grado: data.diploma?.fecha_grado || diploma.fecha_grado,
        libro: data.diploma?.libro || diploma.libro,
        acta: data.diploma?.acta || diploma.acta,
        referencia: data.diploma?.referencia || diploma.referencia,
        correo: data.diploma?.correo || diploma.correo,
        telefono: data.diploma?.telefono || diploma.telefono,
        estado: data.diploma?.estado || diploma.estado,
        valor: data.diploma?.valor || diploma.valor,
        created_at: data.diploma?.created_at || diploma.created_at
      }
    };
  } catch (error) {
    console.error('❌ Error al cargar datos del diploma:', error);
    throw new Error('No se pudieron cargar los datos del diploma. Verifique que el diploma esté disponible.');
  }
};

// Función principal para generar PDF de diploma (IGUAL QUE LOS OTROS SERVICIOS)
const generarDiplomaReal = async (diploma) => {
  try {
    console.log('🔄 Generando diploma para:', diploma);
    
    // Cargar datos reales de la base de datos
    const datosCompletos = await cargarDatosRealesDiploma(diploma);
    
    // Generar plantilla con datos reales
    const docDefinition = await createDiplomaTemplate(datosCompletos);
    
    // Crear PDF
    console.log('📄 Creando PDF con pdfMake');
    const pdfDoc = pdfMake.createPdf(docDefinition);
    console.log('✅ PDF creado exitosamente');
    
    return pdfDoc;
    
  } catch (error) {
    console.error('❌ Error al generar diploma:', error);
    throw error;
  }
};

// Función para descargar el diploma (IGUAL QUE LOS OTROS SERVICIOS)
const descargarDiploma = async (diploma) => {
  try {
    console.log('📥 Iniciando descarga de diploma');
    const pdfDoc = await generarDiplomaReal(diploma);
    const fileName = `Diploma_${diploma.referencia}_${diploma.nombre}_${diploma.apellido}.pdf`;
    console.log('📄 Descargando archivo:', fileName);
    pdfDoc.download(fileName);
    return true;
  } catch (error) {
    console.error('❌ Error al descargar diploma:', error);
    throw error;
  }
};

// Función para ver el diploma en nueva pestaña (IGUAL QUE LOS OTROS SERVICIOS)
const verDiploma = async (diploma) => {
  try {
    console.log('👁️ Iniciando visualización de diploma');
    const pdfDoc = await generarDiplomaReal(diploma);
    console.log('📄 Abriendo PDF en nueva pestaña');
    pdfDoc.open();
    return true;
  } catch (error) {
    console.error('❌ Error al abrir diploma:', error);
    throw error;
  }
};

// Función principal que decide qué diploma generar según el tipo
const generarCertificadoPDFDiploma = async (diploma) => {
  try {
    console.log('🔄 Iniciando generación de PDF de diploma');
    return await generarDiplomaReal(diploma);
  } catch (error) {
    console.error('❌ Error al generar diploma PDF:', error);
    throw error;
  }
};

export default {
  descargarCertificado: descargarDiploma,
  verCertificado: verDiploma,
  generarCertificadoPDF: generarDiplomaReal,

  // Opcionales por si se quieren usar de forma individual
  descargarDiploma,
  verDiploma,
  generarDiplomaReal
};