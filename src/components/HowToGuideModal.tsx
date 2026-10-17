import React from 'react';
import { X, FolderPlus, Sparkles, FolderCheck, ArrowRight } from 'lucide-react';

interface HowToGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToGuideModal: React.FC<HowToGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-left transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#8B1E2D]/10 text-[#8B1E2D] flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Añadir fotos a la carpeta con detección automática
              </h2>
              <p className="text-xs text-slate-500">
                Copia tus imágenes de casas a la carpeta y aparecerán de inmediato
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlight Box: Carpeta /casas */}
        <div className="mt-4 p-4 rounded-xl bg-rose-50/60 border border-[#8B1E2D]/20">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-[#8B1E2D] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Carpeta dedicada: <code className="text-[#8B1E2D] bg-white px-2 py-0.5 rounded border border-rose-200 font-mono">/public/fotos/casas/</code>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                ¡Esta carpeta está configurada con detección en tiempo real! Cualquier imagen que deposites dentro de ella se añade al catálogo con su título, modelo y fecha de forma totalmente automática.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="py-5 space-y-5 text-xs sm:text-sm text-slate-600">
          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#8B1E2D] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-semibold text-slate-800">
                Copiar las imágenes a <code className="text-[#8B1E2D]">/public/fotos/casas/</code>
              </h3>
              <p className="text-slate-600">
                Puedes nombrar las fotos de forma descriptiva para que el título se genere perfectamente, por ejemplo:
              </p>
              <ul className="text-xs text-slate-700 space-y-1 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <li>• <span className="text-[#8B1E2D]">casa-alpina-a-frame-110m2.jpg</span></li>
                <li>• <span className="text-[#8B1E2D]">villa-mediterranea-bioclimatica-165m2.jpg</span></li>
                <li>• <span className="text-[#8B1E2D]">modelo-cubico-modular-140m2.jpg</span></li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#8B1E2D] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-slate-800">
                Aparición automática en la galería
              </h3>
              <p className="text-slate-600">
                El servidor escanea automáticamente la carpeta y registra la fotografía en tiempo real. Al volver a la pestaña de la galería, las nuevas fotos ya estarán visibles en la categoría <strong className="text-slate-800">Casas</strong>.
              </p>
            </div>
          </div>

          {/* Step 3: Other folders */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-semibold text-slate-800">
                Otras carpetas organizadas por categoría
              </h3>
              <p className="text-slate-600">
                También puedes colocar fotos en las subcarpetas tradicionales según su temática:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-slate-700">
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  📁 <span className="font-semibold text-slate-800">/casas/</span>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">Casas y modelos</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  📁 <span className="font-semibold text-slate-800">/exteriores/</span>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">Fachadas, jardines</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  📁 <span className="font-semibold text-slate-800">/interiores/</span>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">Salón, cocinas</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  📁 <span className="font-semibold text-slate-800">/detalles/</span>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">Uniones, acabados</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  📁 <span className="font-semibold text-slate-800">/obra/</span>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">Montaje, grúas</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  📁 <span className="font-semibold text-slate-800">/aereas/</span>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">Drones, entorno</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <FolderCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistema auto-sincronizado</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
