import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FiltersBar } from './components/FiltersBar';
import { PhotoCard } from './components/PhotoCard';
import { LightboxModal } from './components/LightboxModal';
import { DownloadBar } from './components/DownloadBar';
import { ProgressBarModal } from './components/ProgressBarModal';
import { HowToGuideModal } from './components/HowToGuideModal';
import { FotoItem, CategoriaFiltro, DownloadProgressState } from './types';
import {
  downloadSinglePhoto,
  downloadZip,
  downloadPdf,
  downloadWord
} from './services/exportService';
import { Building2, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

const FALLBACK_FOTOS: FotoItem[] = [
  {
    archivo: 'exteriores/modelo-141-principal.jpg',
    titulo: 'Fachada Principal y Terraza al Atardecer',
    categoria: 'exteriores',
    proyecto: 'Modelo 141 m²',
    fecha: '2026-03-12'
  },
  {
    archivo: 'interiores/modelo-141-living-comedor.jpg',
    titulo: 'Salón Comedor con Vigas a la Vista y Cocina Integrada',
    categoria: 'interiores',
    proyecto: 'Modelo 141 m²',
    fecha: '2026-03-14'
  },
  {
    archivo: 'detalles/modelo-141-encuentro-madera-aluminio.jpg',
    titulo: 'Encuentro Carpintería Aluminio y Revestimiento Termotratado',
    categoria: 'detalles',
    proyecto: 'Modelo 141 m²',
    fecha: '2026-03-15'
  },
  {
    archivo: 'obra/montaje-modulo-a3.jpg',
    titulo: 'Montaje en Grúa de Módulo Estructural sobre Cimentación',
    categoria: 'obra',
    proyecto: 'Modelo 141 m²',
    fecha: '2026-02-28'
  },
  {
    archivo: 'aereas/residencia-valle-cubierta-verde.jpg',
    titulo: 'Vista Aérea con Cubierta Vegetal y Piscina Integrada',
    categoria: 'aereas',
    proyecto: 'Residencia Valle 210 m²',
    fecha: '2026-04-02'
  },
  {
    archivo: 'exteriores/modelo-98-patio-cubierto.jpg',
    titulo: 'Módulo Compacto con Porche Cubierto y Paisajismo Seco',
    categoria: 'exteriores',
    proyecto: 'Modelo 98 m²',
    fecha: '2026-04-10'
  }
];

export default function App() {
  const [fotos, setFotos] = useState<FotoItem[]>(FALLBACK_FOTOS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters state
  const [categoriaActual, setCategoriaActual] = useState<CategoriaFiltro>('todas');
  const [proyectoActual, setProyectoActual] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selection state (stored as set of file paths `foto.archivo`)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Lightbox modal index in filtered list
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Guide modal state
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Download & Progress state
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgressState>({
    isDownloading: false,
    type: null,
    progress: 0,
    currentStep: '',
    totalItems: 0,
    currentItemIndex: 0
  });
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Load photos from /api/fotos (real-time folder auto-scan) with fallback to /fotos/fotos.json
  const loadFotosData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    setLoadError(null);
    try {
      // 1. Intentar el endpoint de escaneo automático en tiempo real
      const res = await fetch('/api/fotos', { cache: 'no-cache' });
      if (res.ok) {
        const data: FotoItem[] = await res.json();
        if (Array.isArray(data)) {
          setFotos(data);
          return;
        }
      }
      
      // 2. Fallback a /fotos/fotos.json
      const fallbackRes = await fetch('/fotos/fotos.json', { cache: 'no-cache' });
      if (fallbackRes.ok) {
        const data: FotoItem[] = await fallbackRes.json();
        if (Array.isArray(data)) {
          setFotos(data);
          return;
        }
      }

      setFotos([]);
    } catch (err) {
      console.warn('Usando catálogo inicial preconfigurado:', err);
      setFotos(FALLBACK_FOTOS);
    } finally {
      if (showLoadingState) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFotosData(true);

    // Auto-detección periódica: revisa la carpeta cada 8 segundos
    const interval = setInterval(() => {
      loadFotosData(false);
    }, 8000);

    // Re-escanear inmediatamente cuando el usuario regresa a la pestaña del navegador
    const handleFocus = () => {
      loadFotosData(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Compute unique projects
  const proyectosDisponibles = useMemo(() => {
    const set = new Set<string>();
    fotos.forEach((f) => {
      if (f.proyecto) set.add(f.proyecto);
    });
    return Array.from(set).sort();
  }, [fotos]);

  // Compute counts per category
  const conteoPorCategoria = useMemo(() => {
    const counts: Record<string, number> = {
      casas: 0,
      exteriores: 0,
      interiores: 0,
      detalles: 0,
      obra: 0,
      aereas: 0
    };
    fotos.forEach((f) => {
      const cat = f.categoria.toLowerCase();
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, [fotos]);

  // Filtered photos based on category, project and search
  const fotosFiltradas = useMemo(() => {
    return fotos.filter((f) => {
      // Category filter
      if (categoriaActual !== 'todas' && f.categoria.toLowerCase() !== categoriaActual.toLowerCase()) {
        return false;
      }
      // Project filter
      if (proyectoActual !== 'todos' && f.proyecto !== proyectoActual) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitulo = f.titulo.toLowerCase().includes(query);
        const matchesProyecto = f.proyecto.toLowerCase().includes(query);
        const matchesCategoria = f.categoria.toLowerCase().includes(query);
        const matchesFecha = f.fecha.includes(query);
        if (!matchesTitulo && !matchesProyecto && !matchesCategoria && !matchesFecha) {
          return false;
        }
      }
      return true;
    });
  }, [fotos, categoriaActual, proyectoActual, searchQuery]);

  // Selected photos list
  const fotosSeleccionadas = useMemo(() => {
    return fotos.filter((f) => selectedIds.has(f.archivo));
  }, [fotos, selectedIds]);

  // Selection helpers
  const handleToggleSelect = (archivo: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(archivo)) {
        next.delete(archivo);
      } else {
        next.add(archivo);
      }
      return next;
    });
  };

  const todasEstanSeleccionadas =
    fotosFiltradas.length > 0 &&
    fotosFiltradas.every((f) => selectedIds.has(f.archivo));

  const handleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (todasEstanSeleccionadas) {
        // Deseleccionar todas las fotos filtradas actualmente
        fotosFiltradas.forEach((f) => next.delete(f.archivo));
      } else {
        // Seleccionar todas las fotos del filtro actual
        fotosFiltradas.forEach((f) => next.add(f.archivo));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Determine which photos to download:
  // "Si no hay nada seleccionado, los botones descargan TODAS las fotos del filtro actual."
  const getTargetFotosForDownload = (): FotoItem[] => {
    if (fotosSeleccionadas.length > 0) {
      return fotosSeleccionadas;
    }
    return fotosFiltradas;
  };

  // 1. Download JPG
  const handleDownloadJpg = async () => {
    const targets = getTargetFotosForDownload();
    if (targets.length === 0) return;

    if (targets.length === 1) {
      // Direct single download
      try {
        await downloadSinglePhoto(targets[0]);
        setCompletedMessage(`Fotografía "${targets[0].titulo}" descargada.`);
      } catch (err: any) {
        setDownloadError(err?.message || 'Error al descargar la fotografía.');
      }
      return;
    }

    // Multiple JPGs download
    setDownloadProgress({
      isDownloading: true,
      type: 'individual',
      progress: 10,
      currentStep: 'Iniciando descarga individual por lotes...',
      totalItems: targets.length,
      currentItemIndex: 0
    });
    setCompletedMessage(null);
    setDownloadError(null);

    try {
      for (let i = 0; i < targets.length; i++) {
        const foto = targets[i];
        setDownloadProgress((prev) => ({
          ...prev,
          progress: Math.round(((i + 1) / targets.length) * 100),
          currentStep: `Descargando imagen ${i + 1} de ${targets.length}: "${foto.titulo}"...`,
          currentItemIndex: i + 1
        }));
        await downloadSinglePhoto(foto);
        // Pequeña pausa para no saturar el gestor de descargas del navegador
        await new Promise((r) => setTimeout(r, 200));
      }
      setCompletedMessage(`Se han descargado las ${targets.length} fotografías en formato JPG.`);
    } catch (err: any) {
      setDownloadError(err?.message || 'Error al descargar las fotografías en JPG.');
    } finally {
      setDownloadProgress((prev) => ({ ...prev, isDownloading: false }));
    }
  };

  // 2. Download ZIP
  const handleDownloadZip = async () => {
    const targets = getTargetFotosForDownload();
    if (targets.length === 0) return;

    setDownloadProgress({
      isDownloading: true,
      type: 'zip',
      progress: 5,
      currentStep: 'Preparando carpetas por categoría...',
      totalItems: targets.length,
      currentItemIndex: 0
    });
    setCompletedMessage(null);
    setDownloadError(null);

    try {
      await downloadZip(targets, (p, step) => {
        setDownloadProgress((prev) => ({
          ...prev,
          progress: p,
          currentStep: step
        }));
      });
      setCompletedMessage(
        `Archivo ZIP generado con éxito con ${targets.length} fotos organizadas en subcarpetas.`
      );
    } catch (err: any) {
      setDownloadError(err?.message || 'Error al generar el archivo ZIP.');
    } finally {
      setDownloadProgress((prev) => ({ ...prev, isDownloading: false }));
    }
  };

  // 3. Download PDF
  const handleDownloadPdf = async () => {
    const targets = getTargetFotosForDownload();
    if (targets.length === 0) return;

    setDownloadProgress({
      isDownloading: true,
      type: 'pdf',
      progress: 5,
      currentStep: 'Iniciando compilador de catálogo PDF...',
      totalItems: targets.length,
      currentItemIndex: 0
    });
    setCompletedMessage(null);
    setDownloadError(null);

    try {
      await downloadPdf(targets, (p, step) => {
        setDownloadProgress((prev) => ({
          ...prev,
          progress: p,
          currentStep: step
        }));
      });
      setCompletedMessage(
        `Catálogo PDF generado con portada y ${targets.length} fotos a página completa.`
      );
    } catch (err: any) {
      setDownloadError(err?.message || 'Error al compilar el catálogo PDF.');
    } finally {
      setDownloadProgress((prev) => ({ ...prev, isDownloading: false }));
    }
  };

  // 4. Download Word (.docx)
  const handleDownloadWord = async () => {
    const targets = getTargetFotosForDownload();
    if (targets.length === 0) return;

    setDownloadProgress({
      isDownloading: true,
      type: 'docx',
      progress: 5,
      currentStep: 'Iniciando generación de documento Word...',
      totalItems: targets.length,
      currentItemIndex: 0
    });
    setCompletedMessage(null);
    setDownloadError(null);

    try {
      await downloadWord(targets, (p, step) => {
        setDownloadProgress((prev) => ({
          ...prev,
          progress: p,
          currentStep: step
        }));
      });
      setCompletedMessage(
        `Documento Word (.docx) generado con éxito conteniendo portada y ${targets.length} fotos.`
      );
    } catch (err: any) {
      setDownloadError(err?.message || 'Error al generar el documento Word (.docx).');
    } finally {
      setDownloadProgress((prev) => ({ ...prev, isDownloading: false }));
    }
  };

  // Lightbox handlers
  const currentLightboxFoto =
    lightboxIndex !== null && fotosFiltradas[lightboxIndex]
      ? fotosFiltradas[lightboxIndex]
      : null;

  const handlePrevLightbox = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const handleNextLightbox = () => {
    if (lightboxIndex !== null && lightboxIndex < fotosFiltradas.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 pb-28">
      {/* 1. Brand Header */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        totalFotos={fotos.length}
      />

      {/* 2. Quiet Hero Strip for Context */}
      <section className="bg-slate-50 border-b border-slate-200 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Catálogo Oficial de Obras y Modelos
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Consulte la documentación gráfica de viviendas industrializadas de{' '}
              <span className="font-semibold text-slate-800">MAIN HOUSE</span>.
              Seleccione las imágenes que desee para descargar el lote en formato{' '}
              <span className="font-medium text-[#8B1E2D]">ZIP ordenado por carpetas</span>,
              generar un <span className="font-medium text-[#8B1E2D]">Catálogo PDF</span> o un{' '}
              <span className="font-medium text-[#8B1E2D]">Dossier en Word (.docx)</span>.
            </p>

            {/* Folder notice banner */}
            <div className="pt-3 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Detección automática activa
              </span>
              <span className="text-slate-600">
                Carpeta: <code className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">/public/fotos/casas/</code>
              </span>
              <button
                type="button"
                onClick={() => loadFotosData(false)}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-[#8B1E2D] sm:ml-auto transition-colors cursor-pointer"
                title="Sincronizar ahora"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refrescar carpeta</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Filter and Selection Controls Bar */}
      <FiltersBar
        categoriaActual={categoriaActual}
        setCategoriaActual={setCategoriaActual}
        proyectoActual={proyectoActual}
        setProyectoActual={setProyectoActual}
        proyectosDisponibles={proyectosDisponibles}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        conteoFiltradas={fotosFiltradas.length}
        conteoTotal={fotos.length}
        conteoSeleccionadas={fotosSeleccionadas.length}
        conteoPorCategoria={conteoPorCategoria}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        todasEstanSeleccionadas={todasEstanSeleccionadas}
      />

      {/* 4. Main Gallery Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {fotosFiltradas.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {fotos.length === 0 ? 'La carpeta de casas está vacía' : 'No se encontraron fotografías'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              {fotos.length === 0 ? (
                <>
                  Se han eliminado todas las fotos. Añade tus nuevas imágenes dentro de la carpeta{' '}
                  <code className="font-mono text-[#8B1E2D] bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-xs">
                    /public/fotos/casas/
                  </code>{' '}
                  para que aparezcan automáticamente en la galería.
                </>
              ) : (
                'No hay fotos que coincidan con los filtros aplicados.'
              )}
            </p>
            {fotos.length === 0 ? (
              <button
                onClick={() => setIsGuideOpen(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-[#8B1E2D] hover:bg-[#a02334] text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                Ver cómo añadir fotos
              </button>
            ) : (
              <button
                onClick={() => {
                  setCategoriaActual('todas');
                  setProyectoActual('todos');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Restablecer filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {fotosFiltradas.map((foto, idx) => {
              const isSelected = selectedIds.has(foto.archivo);
              return (
                <PhotoCard
                  key={foto.archivo}
                  foto={foto}
                  isSelected={isSelected}
                  onToggleSelect={() => handleToggleSelect(foto.archivo)}
                  onOpenLightbox={() => setLightboxIndex(idx)}
                  onQuickDownload={() => downloadSinglePhoto(foto)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* 5. Fixed Bottom Download Bar */}
      <DownloadBar
        conteoSeleccionadas={fotosSeleccionadas.length}
        conteoFiltradas={fotosFiltradas.length}
        onDownloadJpg={handleDownloadJpg}
        onDownloadZip={handleDownloadZip}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        onClearSelection={handleClearSelection}
        isDownloading={downloadProgress.isDownloading}
      />

      {/* 6. Fullscreen Lightbox Modal */}
      <LightboxModal
        foto={currentLightboxFoto}
        onClose={() => setLightboxIndex(null)}
        onPrev={handlePrevLightbox}
        onNext={handleNextLightbox}
        hasPrev={lightboxIndex !== null && lightboxIndex > 0}
        hasNext={lightboxIndex !== null && lightboxIndex < fotosFiltradas.length - 1}
        currentIndex={lightboxIndex ?? 0}
        totalFotos={fotosFiltradas.length}
        isSelected={
          currentLightboxFoto
            ? selectedIds.has(currentLightboxFoto.archivo)
            : false
        }
        onToggleSelect={() => {
          if (currentLightboxFoto) {
            handleToggleSelect(currentLightboxFoto.archivo);
          }
        }}
        onDownloadPhoto={(f) => downloadSinglePhoto(f)}
      />

      {/* 7. Progress & Toast Modal */}
      <ProgressBarModal
        progressState={downloadProgress}
        completedMessage={completedMessage}
        errorMessage={downloadError}
        onClose={() => {
          setCompletedMessage(null);
          setDownloadError(null);
        }}
      />

      {/* 8. How to Guide Modal */}
      <HowToGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
