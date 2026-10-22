/**
 * Achica una foto en el navegador para guardarla en Firestore (máximo ~850 KB por foto).
 * Devuelve un data URL JPEG.
 */
const MAX_CHARS = 850_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

export async function compressImage(file: File): Promise<string> {
  const img = await loadImage(file);
  for (const maxSide of [1600, 1280, 1024]) {
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('El navegador no permite procesar fotos');
    ctx.drawImage(img, 0, 0, w, h);
    for (const q of [0.82, 0.72, 0.6]) {
      const data = canvas.toDataURL('image/jpeg', q);
      if (data.length <= MAX_CHARS) return data;
    }
  }
  throw new Error('La foto es demasiado pesada');
}
