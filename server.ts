import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const FOTOS_DIR = path.resolve(__dirname, 'public/fotos');
const FOTOS_JSON_PATH = path.resolve(FOTOS_DIR, 'fotos.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

interface FotoMetadata {
  archivo: string;
  titulo: string;
  categoria: string;
  proyecto: string;
  fecha: string;
}

// Formatear nombre de archivo a título legible
function formatTitleFromFilename(filename: string): { titulo: string; proyecto: string } {
  const nameWithoutExt = path.parse(filename).name;
  
  // Reemplazar guiones y guiones bajos por espacios
  const clean = nameWithoutExt.replace(/[-_]+/g, ' ').trim();
  
  // Si el archivo se llama "imagen X" o similar
  const imagenMatch = clean.match(/^imagen\s*(\d+)$/i);
  if (imagenMatch) {
    return {
      titulo: `Casa — Fotografía ${imagenMatch[1]}`,
      proyecto: 'Modelos de Casas'
    };
  }

  // Si proviene de WhatsApp ("WhatsApp Image 2026-10-18 at 9.37.47 PM")
  if (clean.toLowerCase().includes('whatsapp image')) {
    const timeMatch = clean.match(/at\s+([0-9.]+)\s*(am|pm)?/i);
    const timeStr = timeMatch ? `(${timeMatch[1].replace(/\./g, ':')} ${timeMatch[2] || ''})`.trim() : '';
    return {
      titulo: `Casa Modular — Fotografía ${timeStr}`.trim(),
      proyecto: 'Modelos de Casas'
    };
  }

  // Detectar modelo o metraje si existe (ej. 141m2, 98 m2, etc.)
  const m2Match = clean.match(/(\d+)\s*(m2|m²)/i);
  let proyecto = 'Casas Prefabricadas';
  
  if (clean.toLowerCase().includes('alpina') || clean.toLowerCase().includes('frame')) {
    proyecto = m2Match ? `Modelo Alpino A-Frame ${m2Match[1]} m²` : 'Modelo Alpino A-Frame';
  } else if (clean.toLowerCase().includes('mediterranea') || clean.toLowerCase().includes('villa')) {
    proyecto = m2Match ? `Villa Mediterránea ${m2Match[1]} m²` : 'Villa Mediterránea';
  } else if (m2Match) {
    proyecto = `Modelo ${m2Match[1]} m²`;
  } else if (clean.toLowerCase().includes('valle')) {
    proyecto = 'Residencia Valle';
  }

  // Capitalizar cada palabra para el título
  const titulo = clean
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/\bM2\b/gi, 'm²');

  return { titulo, proyecto };
}

// Escanear todas las imágenes en public/fotos y sus subcarpetas (especialmente /casas)
function scanFotosDirectory(): FotoMetadata[] {
  // 1. Leer fotos.json existente si existe
  let existingList: FotoMetadata[] = [];
  if (fs.existsSync(FOTOS_JSON_PATH)) {
    try {
      const content = fs.readFileSync(FOTOS_JSON_PATH, 'utf-8');
      existingList = JSON.parse(content);
    } catch (e) {
      console.error('Error al leer fotos.json existente:', e);
    }
  }

  const existingMap = new Map<string, FotoMetadata>();
  existingList.forEach(item => {
    // Normalizar ruta relativa (ej. "casas/foto.jpg" o "/fotos/casas/foto.jpg")
    const relKey = item.archivo.replace(/^\/?(fotos\/)?/, '');
    existingMap.set(relKey, item);
  });

  const discoveredItems: FotoMetadata[] = [];
  let jsonNeedsUpdate = false;

  // Subcarpetas esperadas
  const subdirs = ['casas', 'exteriores', 'interiores', 'detalles', 'obra', 'aereas'];
  
  // Asegurar que las carpetas existan
  subdirs.forEach(sub => {
    const dirPath = path.join(FOTOS_DIR, sub);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Leer todos los directorios dentro de public/fotos
  if (fs.existsSync(FOTOS_DIR)) {
    // Si se colocan imágenes directamente en la raíz de public/fotos, moverlas a casas/
    const rootFiles = fs.readdirSync(FOTOS_DIR, { withFileTypes: true });
    for (const rEntry of rootFiles) {
      if (rEntry.isFile()) {
        const ext = path.extname(rEntry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.has(ext)) {
          try {
            fs.renameSync(path.join(FOTOS_DIR, rEntry.name), path.join(FOTOS_DIR, 'casas', rEntry.name));
            console.log(`[Auto-Organize] Movido ${rEntry.name} a /public/fotos/casas/`);
          } catch (e) {
            console.error('Error al mover archivo raíz a casas:', e);
          }
        }
      }
    }

    const entries = fs.readdirSync(FOTOS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const folderName = entry.name;
        const folderPath = path.join(FOTOS_DIR, folderName);
        const files = fs.readdirSync(folderPath);

        // Ordenamiento numérico natural (ej: imagen 1, imagen 2 ... imagen 10)
        files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (IMAGE_EXTENSIONS.has(ext)) {
            const relPath = `${folderName}/${file}`;
            const fullFilePath = path.join(folderPath, file);

            if (existingMap.has(relPath)) {
              // Ya existe en fotos.json, mantener sus datos
              discoveredItems.push(existingMap.get(relPath)!);
            } else {
              // NUEVA FOTO DETECTADA AUTOMÁTICAMENTE
              jsonNeedsUpdate = true;
              const stats = fs.statSync(fullFilePath);
              const fileDate = stats.mtime.toISOString().slice(0, 10);
              const { titulo, proyecto } = formatTitleFromFilename(file);
              
              // Asignar categoría basada en la carpeta
              const categoria = folderName.toLowerCase();

              const newItem: FotoMetadata = {
                archivo: relPath,
                titulo: titulo,
                categoria: categoria,
                proyecto: proyecto,
                fecha: fileDate
              };

              discoveredItems.push(newItem);
              existingMap.set(relPath, newItem);
            }
          }
        }
      }
    }
  }

  // Ordenar la lista completa de descubiertos por nombre de archivo con orden natural
  discoveredItems.sort((a, b) =>
    a.archivo.localeCompare(b.archivo, undefined, { numeric: true, sensitivity: 'base' })
  );

  // Si se agregaron o eliminaron fotos respecto a fotos.json existente
  if (jsonNeedsUpdate || existingList.length !== discoveredItems.length) {
    try {
      fs.writeFileSync(FOTOS_JSON_PATH, JSON.stringify(discoveredItems, null, 2), 'utf-8');
      console.log(`[Auto-Scan] fotos.json sincronizado automáticamente con ${discoveredItems.length} fotos.`);
    } catch (e) {
      console.error('Error al actualizar fotos.json:', e);
    }
  }

  return discoveredItems;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Obtener lista completa de fotos (escaneando carpetas automáticamente)
  app.get('/api/fotos', (req, res) => {
    try {
      const fotos = scanFotosDirectory();
      res.json(fotos);
    } catch (err: any) {
      console.error('Error en /api/fotos:', err);
      res.status(500).json({ error: err.message || 'Error al escanear directorio' });
    }
  });

  // API: Información sobre carpetas escaneadas
  app.get('/api/fotos/carpetas', (req, res) => {
    try {
      const casasPath = path.join(FOTOS_DIR, 'casas');
      const countCasas = fs.existsSync(casasPath) 
        ? fs.readdirSync(casasPath).filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase())).length 
        : 0;

      res.json({
        carpetaCasas: '/public/fotos/casas',
        fotosEnCasas: countCasas,
        autoScanActivo: true,
        carpetasMonitoreadas: ['casas', 'exteriores', 'interiores', 'detalles', 'obra', 'aereas']
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Montar Vite middlewares en desarrollo
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Main House Galería corriendo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
