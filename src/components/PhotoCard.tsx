import React, { useState } from 'react';
import { Download, Maximize2, Check, Calendar, Tag } from 'lucide-react';
import { FotoItem } from '../types';
import { resolvePhotoUrl } from '../services/imageUtils';
import { getCategoryDisplayName } from '../services/exportService';

interface PhotoCardProps {
  foto: FotoItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onOpenLightbox: () => void;
  onQuickDownload: () => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  foto,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  onQuickDownload
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const photoUrl = resolvePhotoUrl(foto.archivo);

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-[#8B1E2D] ring-2 ring-[#8B1E2D]/20 shadow-md'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Aspect ratio container 4:3 */}
      <div
        className="relative w-full aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
        onClick={onOpenLightbox}
      >
        {/* Skeleton loading animation */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse" />
        )}

        {/* Fallback container if broken */}
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-400 text-center">
            <span className="text-xs font-medium">Imagen no disponible</span>
            <span className="text-[11px] text-slate-300 mt-1 truncate max-w-full">
              {foto.archivo}
            </span>
          </div>
        ) : (
          <img
            src={photoUrl}
            alt={foto.titulo}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* Checkbox for selection (Clicking toggles without opening lightbox) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-[#8B1E2D] text-white shadow-sm'
              : 'bg-white/90 text-slate-400 hover:text-slate-700 hover:bg-white border border-slate-300 backdrop-blur-xs opacity-80 group-hover:opacity-100'
          }`}
          aria-label={isSelected ? 'Deseleccionar foto' : 'Seleccionar foto'}
        >
          {isSelected ? (
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          ) : (
            <div className="w-3 h-3 rounded-xs border border-transparent" />
          )}
        </button>

        {/* Quick action buttons in top-right on hover */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickDownload();
            }}
            className="w-7 h-7 rounded-md bg-white/90 hover:bg-white text-slate-700 hover:text-[#8B1E2D] shadow-xs backdrop-blur-xs flex items-center justify-center transition-colors"
            title="Descargar este JPG original"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox();
            }}
            className="w-7 h-7 rounded-md bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 shadow-xs backdrop-blur-xs flex items-center justify-center transition-colors"
            title="Ver a pantalla completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project Tag in bottom-left over image on hover */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="text-[11px] font-semibold tracking-wide text-white drop-shadow-sm uppercase">
            {foto.proyecto}
          </span>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3
            className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-[#8B1E2D] transition-colors cursor-pointer"
            onClick={onOpenLightbox}
            title={foto.titulo}
          >
            {foto.titulo}
          </h3>

          {/* Clean Unboxed Metadata with · separator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="font-medium text-slate-700">{foto.proyecto}</span>
            <span aria-hidden="true">·</span>
            <span>{getCategoryDisplayName(foto.categoria)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {foto.fecha}
          </span>
          <button
            type="button"
            onClick={onQuickDownload}
            className="text-[11px] font-medium text-slate-500 hover:text-[#8B1E2D] flex items-center gap-1 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>JPG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
