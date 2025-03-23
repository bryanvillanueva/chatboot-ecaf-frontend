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
  },
  // Opcionalmente puedes agregar más fuentes
};

// Función para obtener la fecha actual en formato legible
const getCurrentFormattedDate = () => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('es-ES', options);
};

// Plantilla para certificado de notas
const createGradesCertificateTemplate = (data) => {
  return {
    pageSize: 'A4',
    landscape: false, // Ahora en formato portrait (vertical)
    pageMargins: [40, 40, 40, 40],
    content: [
      {
        text: 'ECAF ESCUELA',
        style: 'schoolName',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'CERTIFICADO DE NOTAS',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: [
          { text: 'Número de Certificado: ', style: 'subheader' },
          { text: data.id, style: 'certificateId' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'CERTIFICA QUE:',
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        text: [
          { text: data.nombre + ' ' + data.apellido, style: 'personName' },
          { text: '\nIdentificado con ' + data.tipo_identificacion + ' No. ' + data.numero_identificacion, style: 'normalText' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Ha obtenido las siguientes calificaciones en el programa:',
        style: 'normalText',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        text: data.programa || 'Programa Académico',
        style: 'programName',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      // Tabla de calificaciones
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Asignatura', style: 'tableHeader' },
              { text: 'Créditos', style: 'tableHeader' },
              { text: 'Calificación', style: 'tableHeader' }
            ],
            ...(data.calificaciones || []).map(cal => [
              cal.asignatura,
              cal.creditos,
              cal.nota
            ])
          ]
        },
        margin: [100, 0, 100, 20]
      },
      {
        text: [
          { text: 'Promedio Académico: ', style: 'subheader' },
          { text: data.promedio || '0.0', style: 'normalText' }
        ],
        alignment: 'right',
        margin: [0, 0, 100, 20]
      },
      {
        text: 'Se expide el presente certificado en la ciudad de Bogotá a los ' + getCurrentFormattedDate() + '.',
        style: 'normalText',
        alignment: 'center',
        margin: [0, 0, 0, 40]
      },
      {
        columns: [
          { width: '30%', text: '' },
          {
            width: '40%',
            stack: [
              { text: '____________________________', alignment: 'center' },
              { text: 'Director Académico', style: 'signatureText', alignment: 'center' },
              { text: 'ECAF ESCUELA', style: 'signatureText', alignment: 'center' }
            ]
          },
          { width: '30%', text: '' }
        ]
      }
    ],
    styles: {
      schoolName: { fontSize: 20, bold: true, color: '#CE0A0A', margin: [0, 5, 0, 5] },
      header: { fontSize: 28, bold: true, color: '#CE0A0A' },
      subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
      certificateId: { fontSize: 16, color: '#CE0A0A' },
      personName: { fontSize: 20, bold: true, color: '#333333' },
      programName: { fontSize: 18, bold: true, italics: true },
      normalText: { fontSize: 14, margin: [0, 5, 0, 5] },
      tableHeader: { fontSize: 14, bold: true, color: '#333333', fillColor: '#f8f8f8', alignment: 'center' },
      signatureText: { fontSize: 12, alignment: 'center', margin: [0, 5, 0, 0] }
    },
    defaultStyle: { font: 'Roboto' },
    footer: function(currentPage, pageCount) {
      return {
        text: 'Página ' + currentPage + ' de ' + pageCount,
        alignment: 'center',
        fontSize: 10,
        margin: [0, 10, 0, 0]
      };
    }
  };
};

// Plantilla para certificado de asistencia
const createAttendanceCertificateTemplate = (data) => {
  return {
    pageSize: 'A4',
    landscape: false, // Ahora en formato portrait (vertical)
    pageMargins: [40, 40, 40, 40],
    content: [
      {
        text: 'ECAF ESCUELA',
        style: 'schoolName',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'CERTIFICADO DE ASISTENCIA',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: [
          { text: 'Número de Certificado: ', style: 'subheader' },
          { text: data.id, style: 'certificateId' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'CERTIFICA QUE:',
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        text: [
          { text: data.nombre + ' ' + data.apellido, style: 'personName' },
          { text: '\nIdentificado con ' + data.tipo_identificacion + ' No. ' + data.numero_identificacion, style: 'normalText' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Asistió y participó activamente en el programa:',
        style: 'normalText',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        text: data.programa || 'Programa Académico',
        style: 'programName',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        text: [
          { text: 'Con una duración de ', style: 'normalText' },
          { text: data.horas || '0', style: 'boldText' },
          { text: ' horas académicas, realizado desde el ', style: 'normalText' },
          { text: data.fechaInicio || '01/01/2023', style: 'boldText' },
          { text: ' hasta el ', style: 'normalText' },
          { text: data.fechaFin || '31/12/2023', style: 'boldText' },
          { text: '.', style: 'normalText' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },
      {
        text: 'Los temas tratados fueron:',
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        ul: data.temas || ['Tema 1', 'Tema 2', 'Tema 3'],
        alignment: 'center',
        margin: [200, 0, 200, 30]
      },
      {
        text: 'Se expide el presente certificado en la ciudad de Bogotá a los ' + getCurrentFormattedDate() + '.',
        style: 'normalText',
        alignment: 'center',
        margin: [0, 0, 0, 40]
      },
      {
        columns: [
          { width: '30%', text: '' },
          {
            width: '40%',
            stack: [
              { text: '____________________________', alignment: 'center' },
              { text: 'Director Académico', style: 'signatureText', alignment: 'center' },
              { text: 'ECAF ESCUELA', style: 'signatureText', alignment: 'center' }
            ]
          },
          { width: '30%', text: '' }
        ]
      }
    ],
    styles: {
      schoolName: { fontSize: 20, bold: true, color: '#CE0A0A', margin: [0, 5, 0, 5] },
      header: { fontSize: 28, bold: true, color: '#CE0A0A' },
      subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
      certificateId: { fontSize: 16, color: '#CE0A0A' },
      personName: { fontSize: 20, bold: true, color: '#333333' },
      programName: { fontSize: 18, bold: true, italics: true },
      normalText: { fontSize: 14, margin: [0, 5, 0, 5] },
      boldText: { fontSize: 14, bold: true, margin: [0, 5, 0, 5] },
      signatureText: { fontSize: 12, alignment: 'center', margin: [0, 5, 0, 0] }
    },
    defaultStyle: { font: 'Roboto' },
    footer: function(currentPage, pageCount) {
      return {
        text: 'Página ' + currentPage + ' de ' + pageCount,
        alignment: 'center',
        fontSize: 10,
        margin: [0, 10, 0, 0]
      };
    }
  };
};

// Plantilla para certificado general
const createGeneralCertificateTemplate = (data) => {
  return {
    pageSize: 'A4',
    landscape: false, // Ahora en formato portrait (vertical)
    pageMargins: [40, 40, 40, 40],
    content: [
      {
        text: 'ECAF ESCUELA',
        style: 'schoolName',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'CERTIFICADO GENERAL',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: [
          { text: 'Número de Certificado: ', style: 'subheader' },
          { text: data.id, style: 'certificateId' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'CERTIFICA QUE:',
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        text: [
          { text: data.nombre + ' ' + data.apellido, style: 'personName' },
          { text: '\nIdentificado con ' + data.tipo_identificacion + ' No. ' + data.numero_identificacion, style: 'normalText' }
        ],
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: data.contenidoCertificado || 'Ha participado activamente y cumplido con todos los requisitos del programa académico...',
        style: 'normalText',
        alignment: 'justify',
        margin: [100, 0, 100, 40]
      },
      {
        text: 'Se expide el presente certificado en la ciudad de Bogotá a los ' + getCurrentFormattedDate() + '.',
        style: 'normalText',
        alignment: 'center',
        margin: [0, 0, 0, 40]
      },
      {
        columns: [
          { width: '30%', text: '' },
          {
            width: '40%',
            stack: [
              { text: '____________________________', alignment: 'center' },
              { text: 'Director Académico', style: 'signatureText', alignment: 'center' },
              { text: 'ECAF ESCUELA', style: 'signatureText', alignment: 'center' }
            ]
          },
          { width: '30%', text: '' }
        ]
      }
    ],
    styles: {
      schoolName: { fontSize: 20, bold: true, color: '#CE0A0A', margin: [0, 5, 0, 5] },
      header: { fontSize: 28, bold: true, color: '#CE0A0A' },
      subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
      certificateId: { fontSize: 16, color: '#CE0A0A' },
      personName: { fontSize: 20, bold: true, color: '#333333' },
      normalText: { fontSize: 14, margin: [0, 5, 0, 5], lineHeight: 1.5 },
      signatureText: { fontSize: 12, alignment: 'center', margin: [0, 5, 0, 0] }
    },
    defaultStyle: { font: 'Roboto' },
    footer: function(currentPage, pageCount) {
      return {
        text: 'Página ' + currentPage + ' de ' + pageCount,
        alignment: 'center',
        fontSize: 10,
        margin: [0, 10, 0, 0]
      };
    }
  };
};

// Función para seleccionar la plantilla correcta según el tipo de certificado
const selectTemplate = (certificado) => {
  const tipoCertificado = certificado.tipo_certificado ? certificado.tipo_certificado.toLowerCase() : '';
  if (tipoCertificado.includes('notas')) {
    return createGradesCertificateTemplate(certificado);
  } else if (tipoCertificado.includes('asistencia')) {
    return createAttendanceCertificateTemplate(certificado);
  } else {
    return createGeneralCertificateTemplate(certificado);
  }
};

// Función principal para generar PDF de certificado
const generarCertificadoPDF = async (certificado) => {
  try {
    const certificadoCompleto = await cargarDatosAdicionales(certificado);
    const docDefinition = selectTemplate(certificadoCompleto);
    const pdfDoc = pdfMake.createPdf(docDefinition);
    return pdfDoc;
  } catch (error) {
    console.error('Error al generar certificado PDF:', error);
    throw error;
  }
};

// Función auxiliar para cargar datos adicionales necesarios para el certificado
const cargarDatosAdicionales = async (certificado) => {
  if (certificado.tipo_certificado && certificado.tipo_certificado.toLowerCase().includes('notas')) {
    try {
      const calificaciones = [
        { asignatura: 'Matemáticas', creditos: 4, nota: 4.5 },
        { asignatura: 'Física', creditos: 3, nota: 4.2 },
        { asignatura: 'Programación', creditos: 5, nota: 4.8 }
      ];
      return {
        ...certificado,
        calificaciones,
        promedio: '4.5',
        programa: 'Programación y Desarrollo Web'
      };
    } catch (error) {
      console.error('Error al obtener calificaciones:', error);
      throw error;
    }
  }
  return {
    ...certificado,
    programa: 'Programa Académico de ECAF',
    horas: '120',
    fechaInicio: '01/01/2023',
    fechaFin: '31/12/2023',
    temas: ['Desarrollo Frontend', 'Desarrollo Backend', 'Bases de Datos', 'DevOps']
  };
};

// Función para descargar el certificado
const descargarCertificado = async (certificado) => {
  try {
    const pdfDoc = await generarCertificadoPDF(certificado);
    pdfDoc.download(`Certificado_${certificado.id}_${certificado.nombre}_${certificado.apellido}.pdf`);
    return true;
  } catch (error) {
    console.error('Error al descargar certificado:', error);
    throw error;
  }
};

// Función para abrir el certificado en una nueva pestaña
const verCertificado = async (certificado) => {
  try {
    const pdfDoc = await generarCertificadoPDF(certificado);
    pdfDoc.open();
    return true;
  } catch (error) {
    console.error('Error al abrir certificado:', error);
    throw error;
  }
};

export default {
  generarCertificadoPDF,
  descargarCertificado,
  verCertificado
};
