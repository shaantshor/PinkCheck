// Client-side only. Converts any image (including iPhone HEIC the browser can decode) to JPEG base64.
export async function fileOrCanvasToJpegBase64(
  source: File | Blob | HTMLCanvasElement,
  maxEdge = 1000,
): Promise<string> {
  let w: number;
  let h: number;
  let draw: (ctx: CanvasRenderingContext2D, tw: number, th: number) => void;

  if (source instanceof HTMLCanvasElement) {
    w = source.width;
    h = source.height;
    draw = (ctx, tw, th) => ctx.drawImage(source, 0, 0, tw, th);
  } else {
    const bitmap = await createImageBitmap(source);
    w = bitmap.width;
    h = bitmap.height;
    draw = (ctx, tw, th) => {
      ctx.drawImage(bitmap, 0, 0, tw, th);
      bitmap.close();
    };
  }

  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const tw = Math.round(w * scale);
  const th = Math.round(h * scale);
  const canvas = document.createElement('canvas');
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  draw(ctx, tw, th);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  return dataUrl.replace(/^data:image\/jpeg;base64,/, '');
}
