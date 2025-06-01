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

// Plantilla para certificado de estudio con tabla de módulos y asignaturas
const createStudyCertificateTemplate = async (data) => {
  let logoBase64 = null;
  let firmaBase64 = null;
  
  try {
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
  
  // Preparar header con o sin logo
  const headerContent = logoBase64 ? {
    columns: [
      {
        width: 100,
        image: logoBase64,
        width: 80,
        height: 70,
        alignment: 'center',
        margin: [0, 20, 0, 0]
      },
      {
        width: '*',
        stack: [
          {
            text: ECAF_INFO.nombreCompleto,
            style: 'headerSubtext',
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
        style: 'headerSubtext',
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
  
  // Preparar footer con o sin firma
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
            text: ''
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
  
  // Construir filas de la tabla para módulos y asignaturas
  const módulosRows = [
    [ 
      { text: 'MÓDULO', style: 'tableHeader' }, 
      { text: 'ASIGNATURAS', style: 'tableHeader' } 
    ]
  ];
  if (Array.isArray(data.programa.modulos) && data.programa.modulos.length > 0) {
    data.programa.modulos.forEach((modulo) => {
      const asignaturasText = Array.isArray(modulo.asignaturas) && modulo.asignaturas.length > 0
        ? modulo.asignaturas.map(a => a.nombreAsignatura).join('\n')
        : 'Sin asignaturas registradas';
      módulosRows.push([
        { text: modulo.nombreModulo.toUpperCase(), style: 'tableCellBold' },
        { text: asignaturasText, style: 'tableCell' }
      ]);
    });
  } else {
    módulosRows.push([
      { text: 'No se encontraron módulos registrados', colSpan: 2, style: 'noModulesText', alignment: 'center' }, 
      {}
    ]);
  }

  return {
    pageSize: 'A4',
    landscape: false,
    pageMargins: [50, 80, 50, 100],
    
    // Marca de agua con el logo
    background: logoBase64 ? {
      image: logoBase64,
      width: 300,
      opacity: 0.1,
      alignment: 'center',
      margin: [0, 200, 0, 0]
    } : null,
    
    header: headerContent,
    
    content: [
      {
        text: 'CERTIFICADO DE ESTUDIO',
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
        text: 'Se encuentra matriculado(a) en esta institución educativa en el programa:',
        style: 'introText',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      
      // Programa de estudio
      {
        text: data.programa.nombre.toUpperCase(),
        style: 'programName',
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },
      
      {
        text: 'El programa tiene una duración de ' + data.programa.duracion + ' y se encuentra actualmente ' + 
              (data.programa.estado === 'activo' ? 'en curso' : 'finalizado') + '.',
        style: 'programDetails',
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },
      
      // SECCIÓN DE MÓDULOS Y ASIGNATURAS EN TABLA
      {
        text: 'Contenido Académico:',
        style: 'sectionTitle',
        margin: [0, 20, 0, 10],
        alignment: 'left'
      },
      {
        style: 'tableStyle',
        table: {
          widths: ['40%', '60%'],
          body: módulosRows
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 30]
      },
      
      {
        text: `Se expide el presente certificado en la ciudad de ${ECAF_INFO.ciudad}, a los ${getCurrentFormattedDate()}.`,
        style: 'expeditionText',
        alignment: 'center',
        margin: [0, 0, 0, 25]
      }
    ],
    
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
      programName: {
        fontSize: 16,
        bold: true,
        color: '#CE0A0A'
      },
      programDetails: {
        fontSize: 12,
        color: '#333333',
        lineHeight: 1.3
      },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: '#333333',
        decoration: 'underline'
      },
      tableStyle: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        fillColor: '#CE0A0A',
        color: '#FFFFFF',
        bold: true,
        fontSize: 12,
        alignment: 'center'
      },
      tableCellBold: {
        bold: true,
        fontSize: 11,
        color: '#333333'
      },
      tableCell: {
        fontSize: 10,
        color: '#333333'
      },
      noModulesText: {
        fontSize: 10,
        italics: true,
        color: '#666666',
        colSpan: 2
      },
      expeditionText: {
        fontSize: 11,
        color: '#333333',
        italics: true
      }
    },
    
    defaultStyle: {
      font: 'Roboto',
      lineHeight: 1.2
    }
  };
};

// Función para cargar datos reales de la base de datos
const cargarDatosRealesEstudio = async (certificado) => {
  try {
    const response = await fetch(
      `https://webhook-ecaf-production.up.railway.app/api/certificados/${certificado.id}/datos-estudio`
    );
    
    if (!response.ok) throw new Error(`Error ${response.status}`);
    
    const data = await response.json();

    // Devolvemos las propiedades exactamente como vienen en el JSON:
    return {
      certificado: {
        referencia: data.certificado?.referencia || certificado.referencia,
        nombre: data.estudiante?.nombres || data.certificado?.nombre || certificado.nombre,
        apellido: data.estudiante?.apellidos || data.certificado?.apellido || certificado.apellido,
        tipo_identificacion: data.certificado?.tipo_identificacion || certificado.tipo_identificacion,
        numero_identificacion: data.certificado?.numero_identificacion || certificado.numero_identificacion
      },
      estudiante: {
        nombres: data.estudiante?.nombres || data.certificado?.nombre,
        apellidos: data.estudiante?.apellidos || data.certificado?.apellido
      },
      programa: {
        id: data.programa?.id,
        nombre: data.programa?.nombre || "Programa no especificado",
        duracion: data.programa?.diasDuracion || "Duración no especificada",
        estado: (data.programa?.estadoPrograma || "").toLowerCase() === 'culminado'
                 ? 'finalizado'
                 : 'activo',
        fechaInicio: data.programa?.fechaInicio || "Fecha no disponible",
        fechaFin: data.programa?.fechaFin || "En curso",
        // Copiamos el array de módulos tal como viene:
        modulos: Array.isArray(data.programa?.modulos)
          ? data.programa.modulos.map(m => ({
              idModulo: m.idModulo,
              nombreModulo: m.nombreModulo,
              fechaInicioModulo: m.fechaInicioModulo,
              fechaFinModulo: m.fechaFinModulo,
              asignaturas: Array.isArray(m.asignaturas)
                ? m.asignaturas.map(a => ({
                    idAsignatura: a.idAsignatura,
                    nombreAsignatura: a.nombreAsignatura
                  }))
                : []
            }))
          : []
      }
    };
  } catch (error) {
    console.error('Error al cargar datos de estudio:', error);
    throw error;
  }
};

// Función principal para generar PDF de certificado de estudio
const generarCertificadoEstudioReal = async (certificado) => {
  try {
    console.log('🔄 Generando certificado de estudio para:', certificado);
    
    // Cargar datos reales de la base de datos
    const datosCompletos = await cargarDatosRealesEstudio(certificado);
    
    // Generar plantilla con datos reales
    const docDefinition = await createStudyCertificateTemplate(datosCompletos);
    
    // Crear PDF
    console.log('📄 Creando PDF con pdfMake');
    const pdfDoc = pdfMake.createPdf(docDefinition);
    console.log('✅ PDF creado exitosamente');
    
    return pdfDoc;
    
  } catch (error) {
    console.error('❌ Error al generar certificado de estudio:', error);
    throw error;
  }
};

// Función para descargar el certificado de estudio
const descargarCertificadoEstudio = async (certificado) => {
  try {
    console.log('📥 Iniciando descarga de certificado de estudio');
    const pdfDoc = await generarCertificadoEstudioReal(certificado);
    const fileName = `Certificado_Estudio_${certificado.referencia}_${certificado.nombre}_${certificado.apellido}.pdf`;
    console.log('📄 Descargando archivo:', fileName);
    pdfDoc.download(fileName);
    return true;
  } catch (error) {
    console.error('❌ Error al descargar certificado de estudio:', error);
    throw error;
  }
};

// Función para ver el certificado de estudio en nueva pestaña
const verCertificadoEstudio = async (certificado) => {
  try {
    console.log('👁️ Iniciando visualización de certificado de estudio');
    const pdfDoc = await generarCertificadoEstudioReal(certificado);
    console.log('📄 Abriendo PDF en nueva pestaña');
    pdfDoc.open();
    return true;
  } catch (error) {
    console.error('❌ Error al abrir certificado de estudio:', error);
    throw error;
  }
};

// Función principal que decide qué certificado generar según el tipo
const generarCertificadoPDFEstudio = async (certificado) => {
  try {
    console.log('🔄 Iniciando generación de PDF de estudio');
    const tipoCertificado = certificado.tipo_certificado ? certificado.tipo_certificado.toLowerCase() : '';
    
    if (tipoCertificado.includes('estudio')) {
      return await generarCertificadoEstudioReal(certificado);
    } else {
      throw new Error('Tipo de certificado no implementado aún');
    }
  } catch (error) {
    console.error('❌ Error al generar certificado PDF:', error);
    throw error;
  }
};

export default {
  descargarCertificado: descargarCertificadoEstudio,
  verCertificado: verCertificadoEstudio,
  generarCertificadoPDF: generarCertificadoEstudioReal,

  // Opcionales por si se quieren usar de forma individual
  descargarCertificadoEstudio,
  verCertificadoEstudio,
  generarCertificadoEstudioReal
};