import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DownloadProgressState } from '../types';

interface ProgressBarModalProps {
  progressState: DownloadProgressState;
  completedMessage: string | null;
  errorMessage: string | null;
  onClose: () => void;
}

export const ProgressBarModal: React.FC<ProgressBarModalProps> = ({
  progressState,
  completedMessage,
  errorMessage,
  onClose
}) => {
  if (!progressState.isDownloading && !completedMessage && !errorMessage) {
    return null;
  }

  const getTypeTitle = () => {
    switch (progressState.type) {
      case 'zip':
        return 'Generando paquete ZIP';
      case 'pdf':
        return 'Compilando Catálogo PDF';
      case 'docx':
        return 'Creando Documento Word (.docx)';
      case 'individual':
        return 'Descargando Fotografías JPG';
      default:
        return 'Procesando descarga';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-center transform transition-all">
        {/* Error State */}
        {errorMessage ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ocurrió un problema en la descarga
              </h3>
              <p className="text-xs text-rose-600 mt-1.5">{errorMessage}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : completedMessage ? (
          /* Completed State */
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ¡Descarga completada!
              </h3>
              <p className="text-xs text-slate-600 mt-1.5">{completedMessage}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-lg bg-[#8B1E2D] hover:bg-[#a02334] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Aceptar
            </button>
          </div>
        ) : (
          /* Progress State */
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#8B1E2D]/10 text-[#8B1E2D] mx-auto flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {getTypeTitle()}
              </h3>
              <p className="text-xs text-slate-500 mt-1 min-h-[32px] flex items-center justify-center">
                {progressState.currentStep || 'Preparando archivos...'}
              </p>
            </div>

            {/* Progress Track & Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#8B1E2D] h-full rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${Math.max(progressState.progress, 5)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>Progreso</span>
                <span className="font-semibold text-slate-700">
                  {progressState.progress}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Por favor espere mientras el navegador procesa y empaqueta las imágenes de alta resolución.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
