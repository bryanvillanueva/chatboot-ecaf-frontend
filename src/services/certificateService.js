import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Inicializar pdfMake con las fuentes virtuales (VERSIÓN ORIGINAL)
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

// Registrar fuentes personalizadas (VERSIÓN ORIGINAL)
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

// Plantilla real para certificado de notas con datos de la BD
const createRealGradesCertificateTemplate = async (data) => {
  let logoBase64 = null;
  let firmaBase64 = null;
  
  try {
    // Usar rutas públicas directamente
    console.log('🖼️ Iniciando carga de imágenes...');
    
    try {
      logoBase64 = await convertImageToBase64('/img/logo.png');
      console.log('✅ Logo cargado correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el logo:', error.message);
    }
    
    try {
      firmaBase64 = await convertImageToBase64('/img/firmas.png');
      console.log('✅ Firma cargada correctamente');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar la firma:', error.message);
    }
    
    console.log('🔍 Estado final - Logo:', logoBase64 ? 'CARGADO' : 'NO CARGADO');
    console.log('🔍 Estado final - Firma:', firmaBase64 ? 'CARGADO' : 'NO CARGADO');
    
  } catch (error) {
    console.warn('⚠️ Error general al cargar imágenes:', error);
  }
  
  // Preparar tabla de notas por programa
  const tablasPorPrograma = data.programas.map(programa => {
    const filasAsignaturas = programa.asignaturas.map(asignatura => [
      {
        text: asignatura.nombre,
        style: 'tableCell'
      },
      {
        text: asignatura.modulo || 'N/A',
        style: 'tableCell',
        alignment: 'center'
      },
      {
        text: asignatura.nota.toFixed(1),
        style: 'tableCellNote',
        alignment: 'center'
      }
    ]);
    
    return [
      {
        text: `PROGRAMA: ${programa.nombre.toUpperCase()}`,
        style: 'programHeader',
        margin: [0, 20, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'ASIGNATURA', style: 'tableHeader' },
              { text: 'MÓDULO', style: 'tableHeader' },
              { text: 'NOTA', style: 'tableHeader' }
            ],
            ...filasAsignaturas,
            // Fila de promedio
            [
              { text: 'PROMEDIO DEL PROGRAMA', style: 'tableHeaderPromedio', colSpan: 2 },
              {},
              { text: programa.promedio, style: 'tableCellPromedio', alignment: 'center' }
            ]
          ]
        },
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex === 0) ? '#f0f0f0' : null;
          },
          hLineWidth: function (i, node) {
            return 0.5;
          },
          vLineWidth: function (i, node) {
            return 0.5;
          },
          hLineColor: function (i, node) {
            return '#cccccc';
          },
          vLineColor: function (i, node) {
            return '#cccccc';
          }
        },
        margin: [0, 0, 0, 15]
      }
    ];
  }).flat();
  
  console.log('🔍 Estado final - Logo:', logoBase64 ? 'CARGADO' : 'NO CARGADO');
  console.log('🔍 Estado final - Firma:', firmaBase64 ? 'CARGADO' : 'NO CARGADO');
  
  // Preparar header con o sin logo (ESTRUCTURA ORIGINAL QUE FUNCIONABA)
  const headerContent = logoBase64 ? {
    columns: [
      {
        width: 100,
        image: logoBase64,
        width: 80,
        height: 70,
        alignment: 'center', // CENTRADO COMO PEDISTE
        margin: [0, 20, 0, 0] // MANTENER MÁRGENES ORIGINALES
      },
      {
        width: '*',
        stack: [
          {
            text: ECAF_INFO.nombreCompleto,
            style: 'headerSubtext', // USAR MISMO ESTILO QUE FUNCIONABA
            alignment: 'center',
            margin: [0, 25, 0, 5]
          },
          {
            text: `NIT: ${ECAF_INFO.nit}`,
            style: 'headerSubtext',
            alignment: 'center'
          },
          {
            text: `${ECAF_INFO.direccion} - ${ECAF_INFO.ciudad}`,
            style: 'headerSubtext', 
            alignment: 'center'
          }
        ]
      },
      {
        width: 100,
        text: ''
      }
    ],
    margin: [0, 0, 0, 20]
  } : {
    stack: [
      {
        text: ECAF_INFO.nombreCompleto,
        style: 'headerSubtext', // USAR MISMO ESTILO QUE FUNCIONABA
        alignment: 'center',
        margin: [0, 25, 0, 5]
      },
      {
        text: `NIT: ${ECAF_INFO.nit}`,
        style: 'headerSubtext',
        alignment: 'center'
      },
      {
        text: `${ECAF_INFO.direccion} - ${ECAF_INFO.ciudad}`,
        style: 'headerSubtext', 
        alignment: 'center'
      }
    ],
    margin: [0, 20, 0, 20]
  };
  
  // Preparar footer con o sin firma - SOLO FIRMAS SIN LÍNEAS NI TEXTO
  const footerContent = function(currentPage, pageCount) {
    if (firmaBase64) {
      return {
        columns: [
          {
            width: '*',
            text: ''
          },
          {
            width: 200,
            stack: [
              {
                image: firmaBase64,
                width: 150,
                height: 46,
                alignment: 'center',
                margin: [0, 0, 0, 0]
              }
            ]
          },
          {
            width: '*',
            text: ''
          }
        ],
        margin: [0, 20, 0, 20]
      };
    } else {
      return {
        columns: [
          {
            width: '*',
            text: ''
          },
          {
            width: 200,
            text: '' // Sin contenido si no hay imagen de firma
          },
          {
            width: '*',
            text: ''
          }
        ],
        margin: [0, 20, 0, 20]
      };
    }
  };
  
  return {
    pageSize: 'A4',
    landscape: false,
    pageMargins: [50, 80, 50, 100], // MÁRGENES ORIGINALES
    
    // MARCA DE AGUA CON EL LOGO
    background: logoBase64 ? {
      image: logoBase64,
      width: 300,
      opacity: 0.1,
      alignment: 'center',
      margin: [0, 200, 0, 0]
    } : null,
    
    // HEADER COMO OBJETO DIRECTO (VERSIÓN ORIGINAL)
    header: headerContent,
    
    content: [
      {
        text: 'CERTIFICADO DE NOTAS',
        style: 'certificateTitle',
        alignment: 'center',
        margin: [0, 40, 0, 30]
      },
      
      {
        text: [
          { text: 'Certificado No. ', style: 'certificateNumber' },
          { text: data.certificado.referencia, style: 'certificateNumberValue' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },
      
      {
        text: 'LA ESCUELA DE CAPACITACIÓN DE ACONDICIONAMIENTO FÍSICO - ECAF',
        style: 'institutionStatement',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      
      {
        text: 'CERTIFICA QUE:',
        style: 'certifiesTitle',
        alignment: 'center',
        margin: [0, 0, 0, 25]
      },
      
      {
        text: [
          { text: `${data.certificado.nombre} ${data.certificado.apellido}`.toUpperCase(), style: 'studentName' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      
      {
        text: [
          { text: 'Identificado(a) con ', style: 'studentInfo' },
          { text: `${data.certificado.tipo_identificacion} No. ${data.certificado.numero_identificacion}`, style: 'studentInfoBold' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },
      
      {
        text: 'Ha obtenido las siguientes calificaciones en los programas académicos cursados:',
        style: 'introText',
        alignment: 'center',
        margin: [0, 0, 0, 25]
      },
      
      // Insertar tablas de notas por programa
      ...tablasPorPrograma,
      
      // Promedio general
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'PROMEDIO ACADÉMICO GENERAL', style: 'finalAverageLabel' },
              { text: data.promedioGeneral, style: 'finalAverageValue' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 20, 0, 30]
      },
      
      {
        text: `Se expide el presente certificado en la ciudad de ${ECAF_INFO.ciudad}, a los ${getCurrentFormattedDate()}.`,
        style: 'expeditionText',
        alignment: 'center',
        margin: [0, 0, 0, 25] // REDUCIDO: Era 50, ahora es 25
      }
    ],
    
    // FOOTER COMO FUNCIÓN (VERSIÓN ORIGINAL)
    footer: footerContent,
    
    styles: {
      headerInstitution: {
        fontSize: 14,
        bold: true,
        color: '#CE0A0A'
      },
      headerSubtext: {
        fontSize: 11,
        color: '#333333',
        bold: false
      },
      certificateTitle: {
        fontSize: 24,
        bold: true,
        color: '#CE0A0A',
        decoration: 'underline'
      },
      certificateNumber: {
        fontSize: 12,
        color: '#666666'
      },
      certificateNumberValue: {
        fontSize: 12,
        bold: true,
        color: '#CE0A0A'
      },
      institutionStatement: {
        fontSize: 12,
        bold: true,
        color: '#333333'
      },
      certifiesTitle: {
        fontSize: 16,
        bold: true,
        color: '#333333'
      },
      studentName: {
        fontSize: 18,
        bold: true,
        color: '#CE0A0A'
      },
      studentInfo: {
        fontSize: 12,
        color: '#333333'
      },
      studentInfoBold: {
        fontSize: 12,
        bold: true,
        color: '#333333'
      },
      introText: {
        fontSize: 12,
        color: '#333333',
        lineHeight: 1.3
      },
      programHeader: {
        fontSize: 14,
        bold: true,
        color: '#CE0A0A'
      },
      tableHeader: {
        fontSize: 11,
        bold: true,
        color: '#333333',
        fillColor: '#f0f0f0',
        alignment: 'center'
      },
      tableHeaderPromedio: {
        fontSize: 11,
        bold: true,
        color: '#CE0A0A',
        fillColor: '#f9f9f9'
      },
      tableCell: {
        fontSize: 10,
        color: '#333333'
      },
      tableCellNote: {
        fontSize: 11,
        bold: true,
        color: '#333333'
      },
      tableCellPromedio: {
        fontSize: 11,
        bold: true,
        color: '#CE0A0A'
      },
      finalAverageLabel: {
        fontSize: 14,
        bold: true,
        color: '#CE0A0A',
        alignment: 'right'
      },
      finalAverageValue: {
        fontSize: 16,
        bold: true,
        color: '#CE0A0A',
        alignment: 'center'
      },
      expeditionText: {
        fontSize: 11,
        color: '#333333',
        italics: true
      },
      signatureLine: {
        fontSize: 10,
        color: '#666666'
      },
      signatureTitle: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      },
      signatureInstitution: {
        fontSize: 9,
        color: '#666666'
      },
      firmasText: { // NUEVO ESTILO para "Firmas"
        fontSize: 10,
        color: '#333333',
        bold: true
      }
    },
    
    defaultStyle: {
      font: 'Roboto',
      lineHeight: 1.2
    }
  };
};

// Función para cargar datos reales de la base de datos
const cargarDatosReales = async (certificado) => {
  try {
    // Llamar al endpoint que obtiene las notas reales
    const response = await fetch(`https://webhook-ecaf-production.up.railway.app/api/certificados/${certificado.id}/datos-notas`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron obtener las notas del estudiante`);
    }
    
    const datosCompletos = await response.json();
    return datosCompletos;
    
  } catch (error) {
    console.error('Error al cargar datos reales:', error);
    // Fallback a datos de prueba si hay error
    throw new Error('No se pudieron cargar los datos del certificado. Verifique que el certificado esté disponible.');
  }
};

// Función principal para generar PDF de certificado de notas real
const generarCertificadoNotasReal = async (certificado) => {
  try {
    // Cargar datos reales de la base de datos
    const datosCompletos = await cargarDatosReales(certificado);
    
    // Generar plantilla con datos reales
    const docDefinition = await createRealGradesCertificateTemplate(datosCompletos);
    
    // Crear PDF
    const pdfDoc = pdfMake.createPdf(docDefinition);
    return pdfDoc;
    
  } catch (error) {
    console.error('Error al generar certificado de notas real:', error);
    throw error;
  }
};

// Función para descargar el certificado de notas
const descargarCertificadoNotas = async (certificado) => {
  try {
    const pdfDoc = await generarCertificadoNotasReal(certificado);
    pdfDoc.download(`Certificado_Notas_${certificado.referencia}_${certificado.nombre}_${certificado.apellido}.pdf`);
    return true;
  } catch (error) {
    console.error('Error al descargar certificado de notas:', error);
    throw error;
  }
};

// Función para ver el certificado de notas en nueva pestaña
const verCertificadoNotas = async (certificado) => {
  try {
    const pdfDoc = await generarCertificadoNotasReal(certificado);
    pdfDoc.open();
    return true;
  } catch (error) {
    console.error('Error al abrir certificado de notas:', error);
    throw error;
  }
};

// Función principal que decide qué certificado generar según el tipo
const generarCertificadoPDF = async (certificado) => {
  try {
    const tipoCertificado = certificado.tipo_certificado ? certificado.tipo_certificado.toLowerCase() : '';
    
    if (tipoCertificado.includes('notas')) {
      return await generarCertificadoNotasReal(certificado);
    } else {
      // Para otros tipos, usar las plantillas existentes (por ahora)
      console.warn('Usando plantilla genérica para:', tipoCertificado);
      throw new Error('Tipo de certificado no implementado aún');
    }
  } catch (error) {
    console.error('Error al generar certificado PDF:', error);
    throw error;
  }
};

// Función principal para descargar cualquier tipo de certificado
const descargarCertificado = async (certificado) => {
  try {
    const tipoCertificado = certificado.tipo_certificado ? certificado.tipo_certificado.toLowerCase() : '';
    
    if (tipoCertificado.includes('notas')) {
      return await descargarCertificadoNotas(certificado);
    } else {
      throw new Error('Tipo de certificado no implementado para descarga');
    }
  } catch (error) {
    console.error('Error al descargar certificado:', error);
    throw error;
  }
};

// Función principal para ver cualquier tipo de certificado
const verCertificado = async (certificado) => {
  try {
    const tipoCertificado = certificado.tipo_certificado ? certificado.tipo_certificado.toLowerCase() : '';
    
    if (tipoCertificado.includes('notas')) {
      return await verCertificadoNotas(certificado);
    } else {
      throw new Error('Tipo de certificado no implementado para visualización');
    }
  } catch (error) {
    console.error('Error al ver certificado:', error);
    throw error;
  }
};

export default {
  generarCertificadoPDF,
  descargarCertificado,
  verCertificado,
  // Exportar funciones específicas por si las necesitas
  generarCertificadoNotasReal,
  descargarCertificadoNotas,
  verCertificadoNotas
};