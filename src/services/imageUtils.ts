export function resolvePhotoUrl(archivo: string): string {
  if (archivo.startsWith('http://') || archivo.startsWith('https://')) {
    return archivo;
  }
  if (archivo.startsWith('/fotos/')) {
    return archivo;
  }
  if (archivo.startsWith('fotos/')) {
    return `/${archivo}`;
  }
  if (archivo.startsWith('/')) {
    return archivo;
  }
  return `/fotos/${archivo}`;
}

export async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al cargar la imagen: ${response.statusText} (${url})`);
  }
  return await response.blob();
}

export async function fetchImageArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al obtener buffer de imagen: ${response.statusText} (${url})`);
  }
  return await response.arrayBuffer();
}

export function loadImageDimensions(url: string): Promise<{ dataUrl: string; width: number; height: number; format: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1200;
      canvas.height = img.naturalHeight || 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo inicializar el contexto canvas'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      resolve({
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        format: 'JPEG'
      });
    };
    img.onerror = () => {
      reject(new Error(`Fallo al cargar imagen para exportación: ${url}`));
    };
    img.src = url;
  });
}
