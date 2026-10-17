import React from 'react';
import { Filter, Layers, CheckSquare, Square, Search, X } from 'lucide-react';
import { CategoriaFiltro } from '../types';

interface FiltersBarProps {
  categoriaActual: CategoriaFiltro;
  setCategoriaActual: (cat: CategoriaFiltro) => void;
  proyectoActual: string;
  setProyectoActual: (proj: string) => void;
  proyectosDisponibles: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  conteoFiltradas: number;
  conteoTotal: number;
  conteoSeleccionadas: number;
  conteoPorCategoria: Record<string, number>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  todasEstanSeleccionadas: boolean;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  categoriaActual,
  setCategoriaActual,
  proyectoActual,
  setProyectoActual,
  proyectosDisponibles,
  searchQuery,
  setSearchQuery,
  conteoFiltradas,
  conteoTotal,
  conteoSeleccionadas,
  conteoPorCategoria,
  onSelectAll,
  onClearSelection,
  todasEstanSeleccionadas
}) => {
  const categorias: { id: CategoriaFiltro; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'casas', label: 'Casas' },
    { id: 'exteriores', label: 'Exteriores' },
    { id: 'interiores', label: 'Interiores' },
    { id: 'detalles', label: 'Detalles' },
    { id: 'obra', label: 'Obra' },
    { id: 'aereas', label: 'Aéreas' }
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-4 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Top Controls: Category Tabs & Project Selector & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs (Segmented bar) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {categorias.map((cat) => {
              const count = cat.id === 'todas' ? conteoTotal : (conteoPorCategoria[cat.id] || 0);
              const isActive = categoriaActual === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActual(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#8B1E2D] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Dropdown Proyectos & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Project Selector */}
            <div className="relative min-w-[200px] w-full sm:w-auto">
              <label htmlFor="proyecto-select" className="sr-only">
                Filtrar por proyecto
              </label>
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <select
                id="proyecto-select"
                value={proyectoActual}
                onChange={(e) => setProyectoActual(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1E2D]/20 focus:border-[#8B1E2D] transition-colors cursor-pointer"
              >
                <option value="todos">Todos los proyectos ({conteoTotal})</option>
                {proyectosDisponibles.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Keyword Search */}
            <div className="relative w-full sm:w-48 lg:w-56">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar foto o modelo..."
                className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1E2D]/20 focus:border-[#8B1E2D] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Line & Selection Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-2.5 text-xs sm:text-sm">
          {/* Photo Counter */}
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-900">
              Mostrando {conteoFiltradas} {conteoFiltradas === 1 ? 'foto' : 'fotos'}
            </span>
            {conteoFiltradas !== conteoTotal && (
              <span className="text-slate-400">
                (de un total de {conteoTotal} disponibles)
              </span>
            )}
            {conteoSeleccionadas > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="font-medium text-[#8B1E2D]">
                  {conteoSeleccionadas} {conteoSeleccionadas === 1 ? 'seleccionada' : 'seleccionadas'}
                </span>
              </>
            )}
          </div>

          {/* Quick Selection Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onSelectAll}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                todasEstanSeleccionadas
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>{todasEstanSeleccionadas ? 'Todas seleccionadas' : 'Seleccionar todo'}</span>
            </button>

            {conteoSeleccionadas > 0 && (
              <button
                onClick={onClearSelection}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Limpiar selección</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
