import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  AlignmentType,
  PageBreak
} from 'docx';
import { saveAs } from 'file-saver';
import { FotoItem } from '../types';
import { resolvePhotoUrl, fetchImageBlob, fetchImageArrayBuffer, loadImageDimensions } from './imageUtils';

export function getCleanFileName(foto: FotoItem, ext: string = 'jpg'): string {
  const sanitize = (str: string) =>
    str
      .replace(/[\\/:*?"<>|]/g, '-')
      .replace(/\s+/g, '_')
      .trim();
  return `${sanitize(foto.proyecto)}_${sanitize(foto.titulo)}.${ext}`;
}

export function getCategoryDisplayName(cat: string): string {
  switch (cat.toLowerCase()) {
    case 'casas':
      return 'Casas y Modelos';
    case 'exteriores':
      return 'Exteriores';
    case 'interiores':
      return 'Interiores';
    case 'detalles':
      return 'Detalles Constructivos';
    case 'obra':
      return 'Obra y Montaje';
    case 'aereas':
      return 'Vistas Aéreas';
    default:
      return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
}

/**
 * 1. Descargar foto individual en JPG original
 */
export async function downloadSinglePhoto(foto: FotoItem): Promise<void> {
  const url = resolvePhotoUrl(foto.archivo);
  const blob = await fetchImageBlob(url);
  const fileName = getCleanFileName(foto, 'jpg');
  saveAs(blob, fileName);
}

/**
 * 2. Descargar ZIP organizado por subcarpetas de categoría
 */
export async function downloadZip(
  fotos: FotoItem[],
  onProgress?: (progress: number, step: string) => void
): Promise<void> {
  const zip = new JSZip();
  const total = fotos.length;
  
  if (total === 0) {
    throw new Error('No hay fotos seleccionadas para descargar.');
  }

  // Precrear carpetas requeridas
  const folderCasas = zip.folder('casas');
  const folderExteriores = zip.folder('exteriores');
  const folderInteriores = zip.folder('interiores');
  const folderDetalles = zip.folder('detalles');
  const folderObra = zip.folder('obra');
  const folderAereas = zip.folder('aereas');

  const getFolder = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'casas':
        return folderCasas;
      case 'exteriores':
        return folderExteriores;
      case 'interiores':
        return folderInteriores;
      case 'detalles':
        return folderDetalles;
      case 'obra':
        return folderObra;
      case 'aereas':
        return folderAereas;
      default:
        return zip.folder(categoria.toLowerCase()) || zip;
    }
  };

  let manifestText = `MAIN HOUSE — Casas Prefabricadas\n`;
  manifestText += `Galería de Proyectos — Índice de Archivos Descargados\n`;
  manifestText += `Fecha de exportación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
  manifestText += `Total de imágenes: ${total}\n\n`;
  manifestText += `-------------------------------------------------------------\n`;

  for (let i = 0; i < total; i++) {
    const foto = fotos[i];
    const progressPercent = Math.round(((i + 1) / (total + 1)) * 85);
    onProgress?.(progressPercent, `Descargando imagen ${i + 1} de ${total}: "${foto.titulo}"...`);

    try {
      const url = resolvePhotoUrl(foto.archivo);
      const arrayBuffer = await fetchImageArrayBuffer(url);
      const targetFolder = getFolder(foto.categoria);
      const fileName = getCleanFileName(foto, 'jpg');

      targetFolder?.file(fileName, arrayBuffer);

      manifestText += `[${getCategoryDisplayName(foto.categoria).toUpperCase()}] ${foto.proyecto} - ${foto.titulo}\n`;
      manifestText += `  Archivo: ${foto.categoria}/${fileName}\n`;
      manifestText += `  Fecha registrada: ${foto.fecha}\n\n`;
    } catch (err) {
      console.error(`Error al procesar foto para ZIP: ${foto.archivo}`, err);
    }
  }

  // Agregar archivo de manifiesto al zip
  zip.file('INDICE_FOTOS_MAIN_HOUSE.txt', manifestText);

  onProgress?.(90, 'Comprimiendo archivo ZIP organizado...');
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (meta) => {
      const p = 85 + Math.round((meta.percent / 100) * 14);
      onProgress?.(p, `Comprimiendo paquete ZIP (${Math.round(meta.percent)}%)...`);
    }
  );

  onProgress?.(100, 'Generación completada.');
  const now = new Date().toISOString().slice(0, 10);
  saveAs(zipBlob, `Main-House-Fotos-${now}.zip`);
}

/**
 * 3. Descargar PDF tipo Catálogo con portada y una foto por página
 */
export async function downloadPdf(
  fotos: FotoItem[],
  onProgress?: (progress: number, step: string) => void
): Promise<void> {
  const total = fotos.length;
  if (total === 0) {
    throw new Error('No hay fotos seleccionadas para generar el catálogo PDF.');
  }

  // Formato A4 apaisado / horizontal (297 x 210 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // PORTADA
  onProgress?.(5, 'Diseñando portada del catálogo PDF...');
  
  // Marco y detalles de portada
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Barra de acento superior rojo vino (#8B1E2D = RGB 139, 30, 45)
  doc.setFillColor(139, 30, 45);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Cuadro decorativo sutil
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, 20, pageWidth - 30, pageHeight - 35, 3, 3, 'S');

  // Línea roja institucional interior
  doc.setDrawColor(139, 30, 45);
  doc.setLineWidth(1.2);
  doc.line(30, 48, 120, 48);

  // Textos de portada
  doc.setTextColor(139, 30, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('MAIN HOUSE', 30, 42);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('CASAS PREFABRICADAS · ARQUITECTURA MODULAR', 30, 58);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Galería de Proyectos — Dossier Fotográfico', 30, 75);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  const fechaStr = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Fecha de emisión: ${fechaStr}`, 30, 88);
  doc.text(`Total de fotografías incluidas: ${total}`, 30, 95);

  // Recuadro informativo en portada
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(30, 110, pageWidth - 60, 55, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(30, 110, pageWidth - 60, 55, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(139, 30, 45);
  doc.text('ÍNDICE RESUMIDO DE PROYECTOS INCLUIDOS', 38, 120);

  // Extraer proyectos únicos
  const proyectosUnicos = Array.from(new Set(fotos.map((f) => f.proyecto)));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  let projY = 128;
  for (let pIdx = 0; pIdx < Math.min(proyectosUnicos.length, 5); pIdx++) {
    const pName = proyectosUnicos[pIdx];
    const count = fotos.filter((f) => f.proyecto === pName).length;
    doc.text(`• ${pName} (${count} ${count === 1 ? 'fotografía' : 'fotografías'})`, 38, projY);
    projY += 6;
  }
  if (proyectosUnicos.length > 5) {
    doc.text(`• Y ${proyectosUnicos.length - 5} proyectos más...`, 38, projY);
  }

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Documento privado para clientes y colaboradores · MAIN HOUSE', 30, pageHeight - 22);

  // FOTOS - UNA POR PÁGINA
  for (let i = 0; i < total; i++) {
    const foto = fotos[i];
    const progressPercent = 10 + Math.round(((i + 1) / total) * 85);
    onProgress?.(progressPercent, `Renderizando foto ${i + 1} de ${total}: "${foto.titulo}"...`);

    doc.addPage('a4', 'landscape');

    // Barra superior delgada
    doc.setFillColor(139, 30, 45);
    doc.rect(0, 0, pageWidth, 3, 'F');

    // Cargar dimensiones y dataUrl de la imagen
    try {
      const url = resolvePhotoUrl(foto.archivo);
      const imgInfo = await loadImageDimensions(url);

      // Calcular tamaño proporcional dentro del área disponible
      // Margen disponible: ancho 257mm (desde 20mm hasta 277mm), alto 145mm (desde 15mm hasta 160mm)
      const maxImgW = 257;
      const maxImgH = 145;
      const imgAspect = imgInfo.width / imgInfo.height;
      const targetAspect = maxImgW / maxImgH;

      let drawW = maxImgW;
      let drawH = maxImgH;

      if (imgAspect > targetAspect) {
        drawW = maxImgW;
        drawH = maxImgW / imgAspect;
      } else {
        drawH = maxImgH;
        drawW = maxImgH * imgAspect;
      }

      const imgX = (pageWidth - drawW) / 2;
      const imgY = 14 + (maxImgH - drawH) / 2;

      // Marco suave para la foto
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(imgX - 1, imgY - 1, drawW + 2, drawH + 2, 'S');

      // Colocar imagen
      doc.addImage(imgInfo.dataUrl, 'JPEG', imgX, imgY, drawW, drawH);

      // Pie de foto estructurado
      const footerY = 175;
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.5);
      doc.line(20, footerY, pageWidth - 20, footerY);

      // Título en negrita
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(foto.titulo, 20, footerY + 8);

      // Metadatos (Proyecto, Categoría, Fecha)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(139, 30, 45);
      doc.text(foto.proyecto.toUpperCase(), 20, footerY + 15);

      doc.setTextColor(100, 116, 139);
      doc.text(
        ` ·  Categoría: ${getCategoryDisplayName(foto.categoria)}  ·  Fecha: ${foto.fecha}`,
        20 + doc.getTextWidth(foto.proyecto.toUpperCase()) + 2,
        footerY + 15
      );

      // Número de página y marca
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`MAIN HOUSE — Galería de Proyectos`, pageWidth - 80, footerY + 8);
      doc.text(`Página ${i + 2} de ${total + 1}`, pageWidth - 45, footerY + 15);
    } catch (err) {
      console.error(`Error al incluir imagen en PDF: ${foto.archivo}`, err);
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(12);
      doc.text(`[Error al procesar fotografía: ${foto.titulo}]`, 30, 100);
    }
  }

  onProgress?.(98, 'Finalizando y guardando catálogo PDF...');
  const now = new Date().toISOString().slice(0, 10);
  doc.save(`Main-House-Catalogo-Fotos-${now}.pdf`);
  onProgress?.(100, 'Catálogo PDF descargado con éxito.');
}

/**
 * 4. Descargar documento Word (.docx) con portada y una foto por página
 */
export async function downloadWord(
  fotos: FotoItem[],
  onProgress?: (progress: number, step: string) => void
): Promise<void> {
  const total = fotos.length;
  if (total === 0) {
    throw new Error('No hay fotos seleccionadas para generar el documento Word.');
  }

  onProgress?.(5, 'Iniciando generación de documento Word (.docx)...');

  const fechaStr = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const children: Paragraph[] = [];

  // PORTADA DEL WORD
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
      children: [
        new TextRun({
          text: 'MAIN HOUSE',
          bold: true,
          size: 48,
          color: '8B1E2D',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: 'CASAS PREFABRICADAS · ARQUITECTURA MODULAR',
          size: 22,
          color: '64748B',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 600 },
      children: [
        new TextRun({
          text: 'Galería de Proyectos — Dossier Fotográfico',
          bold: true,
          size: 32,
          color: '1E293B',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Fecha de emisión: ${fechaStr}`,
          size: 20,
          color: '475569',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [
        new TextRun({
          text: `Total de fotografías seleccionadas: ${total}`,
          size: 20,
          color: '475569',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 200 },
      children: [
        new TextRun({
          text: 'Documento confidencial para clientes y colaboradores directos.',
          italics: true,
          size: 18,
          color: '94A3B8',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      children: [new PageBreak()]
    })
  );

  // FOTOS UNA POR PÁGINA
  for (let i = 0; i < total; i++) {
    const foto = fotos[i];
    const progressPercent = 10 + Math.round(((i + 1) / total) * 80);
    onProgress?.(progressPercent, `Insertando foto ${i + 1} de ${total} en Word...`);

    try {
      const url = resolvePhotoUrl(foto.archivo);
      const arrayBuffer = await fetchImageArrayBuffer(url);

      // Título de la foto
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: foto.titulo,
              bold: true,
              size: 28,
              color: '1E293B',
              font: 'Arial'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: `${foto.proyecto}  |  `,
              bold: true,
              size: 20,
              color: '8B1E2D',
              font: 'Arial'
            }),
            new TextRun({
              text: `Categoría: ${getCategoryDisplayName(foto.categoria)}  |  Fecha: ${foto.fecha}`,
              size: 20,
              color: '64748B',
              font: 'Arial'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new ImageRun({
              type: 'jpg',
              data: new Uint8Array(arrayBuffer),
              transformation: {
                width: 580,
                height: 435
              }
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `Foto ${i + 1} de ${total} · MAIN HOUSE Casas Prefabricadas`,
              italics: true,
              size: 16,
              color: '94A3B8',
              font: 'Arial'
            })
          ]
        })
      );

      // Si no es la última foto, insertar salto de página
      if (i < total - 1) {
        children.push(
          new Paragraph({
            children: [new PageBreak()]
          })
        );
      }
    } catch (err) {
      console.error(`Error al insertar imagen en Word: ${foto.archivo}`, err);
    }
  }

  onProgress?.(95, 'Generando archivo de Word comprimido (.docx)...');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  onProgress?.(100, 'Documento Word listo.');
  const now = new Date().toISOString().slice(0, 10);
  saveAs(blob, `Main-House-Dossier-Proyectos-${now}.docx`);
}
