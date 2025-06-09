import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Inicializar pdfMake con las fuentes virtuales
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

// Registrar fuentes personalizadas
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
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

// Función para convertir imagen a base64 (necesaria para pdfMake)
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

// Función auxiliar para probar rutas alternativas
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

// Función para crear los bordes decorativos del diploma
const createDecorativeBorders = () => {
  return {
    // Borde decorativo superior izquierdo (triángulo dorado)
    canvas: [
      // Triángulo dorado superior izquierdo
      {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 150, y: 0 },
          { x: 0, y: 150 }
        ],
        color: '#FFD700'
      },
      // Triángulo rojo superior derecho
      {
        type: 'polygon',
        points: [
          { x: 450, y: 0 },
          { x: 595, y: 0 },
          { x: 595, y: 145 }
        ],
        color: '#CE0A0A'
      },
      // Triángulo dorado inferior derecho
      {
        type: 'polygon',
        points: [
          { x: 595, y: 250 },
          { x: 595, y: 400 },
          { x: 445, y: 400 }
        ],
        color: '#FFD700'
      },
      // Triángulo rojo inferior izquierdo
      {
        type: 'polygon',
        points: [
          { x: 0, y: 400 },
          { x: 150, y: 400 },
          { x: 0, y: 250 }
        ],
        color: '#CE0A0A'
      }
    ]
  };
};

// Plantilla para diploma basada en la imagen exacta
const createDiplomaTemplate = async (data) => {
  let logoECAFBase64 = null;
  let escudoColombiaBase64 = null;
  let firmaDirectorBase64 = null;
  let firmaCoordinadoraBase64 = null;
  
  try {
    console.log('🖼️ Iniciando carga de imágenes...');
    
    // Cargar logo de ECAF (circular, lado derecho)
    try {
      logoECAFBase64 = await convertImageToBase64('/img/logo.png');
      console.log('✅ Logo ECAF cargado correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el logo ECAF:', error.message);
    }
    
    // Cargar escudo de Colombia (lado izquierdo)
    try {
      escudoColombiaBase64 = await convertImageToBase64('/img/escudo-colombia.png');
      console.log('✅ Escudo de Colombia cargado correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el escudo de Colombia:', error.message);
    }
    
    // Cargar firmas
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

  return {
    pageSize: 'A4',
    landscape: true, // Diploma en formato horizontal
    pageMargins: [40, 40, 40, 40],
    
    // Fondo con bordes decorativos
    background: [
      // Marca de agua central con el logo ECAF
      logoECAFBase64 ? {
        image: logoECAFBase64,
        width: 400,
        opacity: 0.08,
        alignment: 'center',
        margin: [0, 150, 0, 0]
      } : null,
      
      // Bordes decorativos con triángulos
      createDecorativeBorders()
    ].filter(Boolean),
    
    content: [
      // HEADER PRINCIPAL
      {
        columns: [
          // Escudo de Colombia (izquierda)
          {
            width: 80,
            stack: escudoColombiaBase64 ? [
              {
                image: escudoColombiaBase64,
                width: 70,
                height: 80,
                alignment: 'center',
                margin: [0, 0, 0, 0]
              }
            ] : [{ text: '', height: 80 }]
          },
          
          // Título central
          {
            width: '*',
            stack: [
              {
                text: 'ESCUELA DE CAPACITACIÓN PARA EL ACONDICIONAMIENTO FÍSICO',
                style: 'mainTitle',
                alignment: 'center',
                margin: [0, 8, 0, 2]
              },
              {
                text: '"ECAF"',
                style: 'ecafTitle',
                alignment: 'center',
                margin: [0, 0, 0, 5]
              },
              {
                text: 'Institución de Educación Para el Trabajo y el Desarrollo Humano',
                style: 'subtitle',
                alignment: 'center',
                margin: [0, 0, 0, 2]
              },
              {
                text: 'Aprobado por la Secretaría de Educación Distrital de Barranquilla Mediante Resolución No 001356 de 2006 y con Personería Jurídica No.00194 de 2007',
                style: 'resolution',
                alignment: 'center',
                margin: [0, 0, 0, 2]
              },
              {
                text: 'emanada por la Gobernación del Atlántico.',
                style: 'resolution',
                alignment: 'center'
              }
            ]
          },
          
          // Logo ECAF (derecha)
          {
            width: 80,
            stack: logoECAFBase64 ? [
              {
                image: logoECAFBase64,
                width: 70,
                height: 70,
                alignment: 'center',
                margin: [0, 5, 0, 0]
              }
            ] : [{ text: '', height: 80 }]
          }
        ],
        margin: [0, 0, 0, 25]
      },
      
      // "Certifica que" - centrado y en cursiva
      {
        text: 'Certifica que',
        style: 'certificaQue',
        alignment: 'center',
        margin: [0, 15, 0, 20]
      },
      
      // NOMBRE DEL ESTUDIANTE - grande y destacado
      {
        text: `${data.diploma.nombre} ${data.diploma.apellido}`.toUpperCase(),
        style: 'studentName',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      
      // LÍNEA DECORATIVA bajo el nombre
      {
        canvas: [
          {
            type: 'line',
            x1: 150, y1: 0,
            x2: 645, y2: 0,
            lineWidth: 2,
            lineColor: '#CE0A0A'
          }
        ],
        margin: [0, 0, 0, 15]
      },
      
      // NÚMERO DE IDENTIFICACIÓN
      {
        text: `Con ${data.diploma.tipo_identificacion} ${data.diploma.numero_identificacion}`,
        style: 'identification',
        alignment: 'center',
        margin: [0, 0, 0, 25]
      },
      
      // TEXTO PRINCIPAL DEL CERTIFICADO
      {
        text: 'Asistió y aprobó el diplomado de:',
        style: 'mainText',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      
      // NOMBRE DEL PROGRAMA/DIPLOMADO
      {
        text: (data.diploma.nombre_tipo_diploma || data.diploma.tipo_diploma || 'PERSONAL TRAINER').toUpperCase(),
        style: 'programTitle',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      
      // MODALIDAD
      {
        text: `(${(data.diploma.modalidad || 'PRESENCIAL').toUpperCase()})`,
        style: 'modality',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      
      // TEXTO DE CUMPLIMIENTO
      {
        text: 'Cumpliendo satisfactoriamente los requisitos académicos y reglamentarios correspondiente al plan de estudio establecido por esta institución',
        style: 'complianceText',
        alignment: 'center',
        margin: [0, 0, 0, 25]
      },
      
      // FECHA Y LUGAR DE EXPEDICIÓN
      {
        text: `Para su constancia se firma en la ciudad de ${ECAF_INFO.ciudad} el día ${formatearFechaGrado(data.diploma.fecha_grado)}`,
        style: 'expeditionText',
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },
      
      // SECCIÓN DE FIRMAS
      {
        columns: [
          // Firma del Director
          {
            width: '*',
            stack: [
              firmaDirectorBase64 ? {
                image: firmaDirectorBase64,
                width: 120,
                height: 40,
                alignment: 'center',
                margin: [0, 0, 0, 5]
              } : {
                text: '________________________',
                alignment: 'center',
                margin: [0, 20, 0, 5]
              },
              {
                text: 'Director',
                style: 'signatureTitle',
                alignment: 'center'
              }
            ]
          },
          
          // Firma de la Coordinadora Académica
          {
            width: '*',
            stack: [
              firmaCoordinadoraBase64 ? {
                image: firmaCoordinadoraBase64,
                width: 120,
                height: 40,
                alignment: 'center',
                margin: [0, 0, 0, 5]
              } : {
                text: '________________________',
                alignment: 'center',
                margin: [0, 20, 0, 5]
              },
              {
                text: 'Coordinadora Académica',
                style: 'signatureTitle',
                alignment: 'center'
              }
            ]
          }
        ],
        margin: [60, 0, 60, 20]
      },
      
      // INFORMACIÓN FINAL (Barranquilla, Libro, Acta)
      {
        columns: [
          {
            width: '*',
            text: `${ECAF_INFO.ciudad}, ${formatearFechaGrado(data.diploma.fecha_grado)}`,
            style: 'footerInfo',
            alignment: 'left'
          },
          {
            width: 'auto',
            text: `Libro No. ${data.diploma.libro || '___'}`,
            style: 'footerInfo',
            alignment: 'center',
            margin: [20, 0, 20, 0]
          },
          {
            width: 'auto',
            text: `Acta No. ${data.diploma.acta || '___'}`,
            style: 'footerInfo',
            alignment: 'right'
          }
        ],
        margin: [0, 15, 0, 0]
      }
    ],
    
    styles: {
      mainTitle: {
        fontSize: 16,
        bold: true,
        color: '#333333'
      },
      ecafTitle: {
        fontSize: 32,
        bold: true,
        color: '#CE0A0A'
      },
      subtitle: {
        fontSize: 12,
        italics: true,
        color: '#333333'
      },
      resolution: {
        fontSize: 8,
        color: '#666666'
      },
      certificaQue: {
        fontSize: 18,
        italics: true,
        color: '#333333'
      },
      studentName: {
        fontSize: 32,
        bold: true,
        color: '#CE0A0A'
      },
      identification: {
        fontSize: 14,
        color: '#333333'
      },
      mainText: {
        fontSize: 16,
        color: '#333333'
      },
      programTitle: {
        fontSize: 24,
        bold: true,
        color: '#333333'
      },
      modality: {
        fontSize: 14,
        bold: true,
        color: '#333333'
      },
      complianceText: {
        fontSize: 12,
        color: '#333333',
        lineHeight: 1.4
      },
      expeditionText: {
        fontSize: 12,
        color: '#333333'
      },
      signatureTitle: {
        fontSize: 11,
        bold: true,
        color: '#333333'
      },
      footerInfo: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      }
    },
    
    defaultStyle: {
      font: 'Roboto',
      lineHeight: 1.2
    }
  };
};

// Función para cargar datos reales de la base de datos
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

    // Devolvemos las propiedades exactamente como vienen en el JSON:
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

// Función principal para generar PDF de diploma
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

// Función para descargar el diploma
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

// Función para ver el diploma en nueva pestaña
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