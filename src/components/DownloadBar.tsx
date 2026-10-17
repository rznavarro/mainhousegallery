import React from 'react';
import { Download, FileArchive, FileText, FileSpreadsheet, CheckCircle2, X } from 'lucide-react';

interface DownloadBarProps {
  conteoSeleccionadas: number;
  conteoFiltradas: number;
  onDownloadJpg: () => void;
  onDownloadZip: () => void;
  onDownloadPdf: () => void;
  onDownloadWord: () => void;
  onClearSelection: () => void;
  isDownloading: boolean;
}

export const DownloadBar: React.FC<DownloadBarProps> = ({
  conteoSeleccionadas,
  conteoFiltradas,
  onDownloadJpg,
  onDownloadZip,
  onDownloadPdf,
  onDownloadWord,
  onClearSelection,
  isDownloading
}) => {
  const tieneSeleccion = conteoSeleccionadas > 0;
  const cantidadEfectiva = tieneSeleccion ? conteoSeleccionadas : conteoFiltradas;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-3 sm:pb-5">
        <div className="pointer-events-auto bg-slate-900/95 text-white backdrop-blur-lg border border-slate-700/80 rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 ring-1 ring-white/10 transition-all">
          {/* Left status info */}
          <div className="flex items-center justify-between md:justify-start gap-3 min-w-0">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  tieneSeleccion ? 'bg-[#8B1E2D] text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white whitespace-nowrap">
                    {tieneSeleccion
                      ? `${conteoSeleccionadas} ${conteoSeleccionadas === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}`
                      : `Exportar fotos del filtro (${conteoFiltradas})`}
                  </span>
                  {tieneSeleccion && (
                    <button
                      onClick={onClearSelection}
                      className="text-xs text-slate-400 hover:text-white underline underline-offset-2 flex items-center gap-1 transition-colors"
                      title="Limpiar selección"
                    >
                      <X className="w-3 h-3" />
                      <span>Limpiar</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {tieneSeleccion
                    ? 'Opciones de descarga para las fotografías marcadas'
                    : 'Sin selección previa: los botones procesarán todas las fotos mostradas'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Download Buttons: JPG, ZIP, PDF, Word */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
            {/* 1. Descargar individual / JPG */}
            <button
              onClick={onDownloadJpg}
              disabled={isDownloading || cantidadEfectiva === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white text-xs sm:text-sm font-medium border border-slate-700 transition-colors shadow-2xs cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              title="Descargar foto(s) original(es) en formato JPG"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>JPG {tieneSeleccion && conteoSeleccionadas === 1 ? '' : `(${cantidadEfectiva})`}</span>
            </button>

            {/* 2. Descargar ZIP organizado */}
            <button
              onClick={onDownloadZip}
              disabled={isDownloading || cantidadEfectiva === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#8B1E2D] hover:bg-[#a02334] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              title="Descargar paquete ZIP organizado en carpetas por categoría (exteriores, interiores, etc.)"
            >
              <FileArchive className="w-4 h-4" />
              <span>Descargar ZIP</span>
            </button>

            {/* 3. Descargar PDF Catálogo */}
            <button
              onClick={onDownloadPdf}
              disabled={isDownloading || cantidadEfectiva === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs sm:text-sm font-medium border border-white/15 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              title="Generar catálogo en PDF con portada formal y una foto por página"
            >
              <FileText className="w-4 h-4 text-rose-300" />
              <span>Catálogo PDF</span>
            </button>

            {/* 4. Descargar Word (.docx) */}
            <button
              onClick={onDownloadWord}
              disabled={isDownloading || cantidadEfectiva === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs sm:text-sm font-medium border border-white/15 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              title="Generar documento Word (.docx) editable con portada y fotos a página completa"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-300" />
              <span>Word (.docx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
