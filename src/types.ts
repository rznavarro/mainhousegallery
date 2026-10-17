export interface FotoItem {
  archivo: string;
  titulo: string;
  categoria: 'exteriores' | 'interiores' | 'detalles' | 'obra' | 'aereas' | string;
  proyecto: string;
  fecha: string;
}

export type CategoriaFiltro = 'todas' | 'casas' | 'exteriores' | 'interiores' | 'detalles' | 'obra' | 'aereas';

export interface DownloadProgressState {
  isDownloading: boolean;
  type: 'zip' | 'pdf' | 'docx' | 'individual' | null;
  progress: number; // 0 - 100
  currentStep: string;
  totalItems: number;
  currentItemIndex: number;
}
