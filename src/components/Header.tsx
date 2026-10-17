import React from 'react';
import { Home, HelpCircle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  totalFotos: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, totalFotos }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Identity Zone */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-[#8B1E2D] flex items-center justify-center text-white shadow-xs shrink-0">
              <Home className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                  MAIN HOUSE
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-[#8B1E2D] bg-[#8B1E2D]/8 px-2 py-0.5 rounded-sm">
                  Casas Prefabricadas
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-normal mt-0.5 truncate">
                Galería de proyectos · Dossier fotográfico privado
              </p>
            </div>
          </div>

          {/* Right Action Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Acceso de solo lectura</span>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-slate-700">{totalFotos} fotos</span>
            </div>

            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B1E2D]"
              title="Instrucciones para añadir o gestionar fotografías"
            >
              <HelpCircle className="w-4 h-4 text-[#8B1E2D]" />
              <span className="hidden sm:inline">Cómo agregar fotos</span>
              <span className="sm:hidden">Guía</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
