import { Router, Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

const router = Router();

// Helper: create frame border based on style
function getFrameConfig(style: string) {
  const configs: Record<string, { width: number; color: string; shadow: boolean; double: boolean }> = {
    'none': { width: 0, color: '#000', shadow: false, double: false },
    'thin-black': { width: 4, color: '#111111', shadow: true, double: false },
    'thin-white': { width: 4, color: '#f5f5f5', shadow: true, double: false },
    'classic-gold': { width: 12, color: '#b8860b', shadow: true, double: false },
    'classic-silver': { width: 12, color: '#c0c0c0', shadow: true, double: false },
    'ornate-gold': { width: 24, color: '#a67c00', shadow: true, double: true },
    'ornate-dark': { width: 24, color: '#2d2d2d', shadow: true, double: true },
    'natural-oak': { width: 16, color: '#c19a6b', shadow: true, double: false },
    'natural-walnut': { width: 16, color: '#5c3317', shadow: true, double: false },
    'natural-maple': { width: 16, color: '#f2d2a9', shadow: true, double: false },
    'floating-white': { width: 3, color: '#f5f5f5', shadow: true, double: false },
    'floating-black': { width: 3, color: '#111111', shadow: true, double: false },
    'shadow-box': { width: 30, color: '#1a1a1a', shadow: true, double: false },
    'canvas-wrap': { width: 0, color: '#000', shadow: true, double: false },
    'ai-generated': { width: 0, color: '#000', shadow: true, double: false }, // AI frame handled separately
  };
  return configs[style] || configs['none'];
}

function getMatColor(option: string): string {
  const colors: Record<string, string> = {
    'none': 'transparent',
    'white': '#ffffff',
    'cream': '#fdf6e3',
    'black': '#1a1a1a',
    'grey': '#9ca3af',
  };
  return colors[option] || 'transparent';
}

type FitContainResult = {
  width: number;
  height: number;
  left: number;
  top: number;
};

function sanitizePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.max(1, Math.round(parsed));
}

function getContainRect(containerW: number, containerH: number, sourceW: number, sourceH: number): FitContainResult {
  const safeContainerW = sanitizePositiveInt(containerW, 1);
  const safeContainerH = sanitizePositiveInt(containerH, 1);
  const safeSourceW = sanitizePositiveInt(sourceW, 1);
  const safeSourceH = sanitizePositiveInt(sourceH, 1);

  const scale = Math.min(safeContainerW / safeSourceW, safeContainerH / safeSourceH);
  const width = Math.max(1, Math.round(safeSourceW * scale));
  const height = Math.max(1, Math.round(safeSourceH * scale));

  return {
    width,
    height,
    left: Math.round((safeContainerW - width) / 2),
    top: Math.round((safeContainerH - height) / 2),
  };
}

async function createFramedArtwork(
  artworkBuffer: Buffer,
  artW: number,
  artH: number,
  totalW: number,
  totalH: number,
  frameCfg: { width: number; color: string; shadow: boolean; double: boolean },
  matPx: number,
  matColor: string,
  aiFrameBuffer?: Buffer,
): Promise<Buffer> {
  const fw = Math.max(0, sanitizePositiveInt(frameCfg.width, 0));

  // If AI frame provided, scale with contain logic to avoid frame distortion.
  if (aiFrameBuffer) {
    const aiMeta = await sharp(aiFrameBuffer).metadata();
    const aiFrameRect = getContainRect(totalW, totalH, aiMeta.width || totalW, aiMeta.height || totalH);

    const resizedFrame = await sharp(aiFrameBuffer)
      .resize(aiFrameRect.width, aiFrameRect.height, { fit: 'fill' })
      .png()
      .toBuffer();

    const framedCanvas = await sharp({
      create: {
        width: totalW,
        height: totalH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      }
    })
      .composite([
        {
          input: resizedFrame,
          left: aiFrameRect.left,
          top: aiFrameRect.top,
        }
      ])
      .png()
      .toBuffer();

    const innerW = Math.max(1, totalW - (fw + matPx) * 2);
    const innerH = Math.max(1, totalH - (fw + matPx) * 2);
    const artRect = getContainRect(innerW, innerH, artW, artH);

    return await sharp(framedCanvas)
      .composite([
        {
          input: artworkBuffer,
          left: fw + matPx + artRect.left,
          top: fw + matPx + artRect.top,
        }
      ])
      .png()
      .toBuffer();
  }

  // Create base canvas for the full framed piece
  const svg = `
<svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="4" dy="6" stdDeviation="8" flood-opacity="0.4"/>
    </filter>
    <filter id="innerShadow">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="3" result="offset-blur"/>
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
      <feFlood flood-color="black" flood-opacity=".2" result="color"/>
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>
  </defs>
  ${frameCfg.shadow ? `<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="${frameCfg.color}" rx="1" filter="url(#shadow)"/>` : ''}
  ${fw > 0 ? `<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="${frameCfg.color}" rx="1"/>` : ''}
  ${frameCfg.double && fw > 0 ? `<rect x="${fw/3}" y="${fw/3}" width="${totalW - fw*2/3}" height="${totalH - fw*2/3}" fill="none" stroke="${frameCfg.color === '#a67c00' ? '#d4a844' : '#555'}" stroke-width="1"/>` : ''}
  ${matPx > 0 ? `<rect x="${fw}" y="${fw}" width="${totalW - fw*2}" height="${totalH - fw*2}" fill="${matColor}"/>` : ''}
</svg>
  `;

  const svgBuffer = Buffer.from(svg);
  const result = await sharp(svgBuffer)
    .composite([
      {
        input: artworkBuffer,
        left: fw + matPx,
        top: fw + matPx,
      }
    ])
    .png()
    .toBuffer();

  return result;
}

// Configure multer for file uploads
const upload = multer({ 
  dest: path.join(__dirname, '..', '..', 'uploads') 
});

// Download image from URL to temp file
async function downloadImage(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }
  
  const buffer = Buffer.from(await response.arrayBuffer());
  const tempPath = path.join(__dirname, '..', '..', 'uploads', `temp-${uuid()}.png`);
  fs.mkdirSync(path.dirname(tempPath), { recursive: true });
  fs.writeFileSync(tempPath, buffer);
  
  return tempPath;
}

// Composite artwork onto environment using Sharp
router.post('/composite', upload.fields([
  { name: 'artwork', maxCount: 1 },
  { name: 'environment', maxCount: 1 },
]), async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const artworkFile = files?.artwork?.[0];
  const environmentFile = files?.environment?.[0];
  const environmentFileUrl = req.body.environmentUrl;
  const aiFrameImageUrl = req.body.aiFrameImageUrl;
  
  if (!artworkFile) {
    return res.status(400).json({ error: 'Artwork image is required' });
  }

  if (!environmentFile && !environmentFileUrl) {
    return res.status(400).json({ error: 'Either environment file or environment URL is required' });
  }

  let envPath: string | null = null;
  let aiFramePath: string | null = null;
  let envTempFile = false;
  let aiFrameTempFile = false;

  try {
    const { width, height, unit, frameStyle, matOption, matWidth, posX = 50, posY = 45, scale = 1, aiFrameBorderWidth } = req.body;

    const requestedWidth = sanitizePositiveInt(width, 1);
    const requestedHeight = sanitizePositiveInt(height, 1);
    const safeScale = Math.max(0.1, Number(scale) || 1);

    // Get environment image path (download if URL provided)
    if (environmentFile) {
      envPath = environmentFile.path;
    } else if (environmentFileUrl) {
      envPath = await downloadImage(environmentFileUrl);
      envTempFile = true;
    }

    // Get AI frame image if provided
    let aiFrameBuffer: Buffer | undefined;
    if (aiFrameImageUrl) {
      aiFramePath = await downloadImage(aiFrameImageUrl);
      aiFrameTempFile = true;
      aiFrameBuffer = await sharp(aiFramePath).toBuffer();
    }

    // Load environment image to get its dimensions
    const envMeta = await sharp(envPath!).metadata();
    const envWidth = envMeta.width || 1920;
    const envHeight = envMeta.height || 1080;

    // Calculate artwork pixel size relative to environment.
    // Source of truth for proportion is user dimensions (requestedWidth/requestedHeight).
    const pxPerInch = envWidth / 120;
    const artW = Math.max(1, Math.round(requestedWidth * pxPerInch * safeScale));
    const artH = Math.max(1, Math.round(requestedHeight * pxPerInch * safeScale));

    // Frame dimensions
    const frameCfg = getFrameConfig(frameStyle);
    // Use AI frame border width if provided
    if (aiFrameBorderWidth) {
      frameCfg.width = Math.max(0, Number.parseInt(String(aiFrameBorderWidth), 10) || 0);
    }
    const parsedMatWidth = Number(matWidth);
    const safeMatWidth = Number.isFinite(parsedMatWidth) ? Math.max(0, parsedMatWidth) : 0;
    const matPx = matOption !== 'none' ? Math.round(safeMatWidth * pxPerInch) : 0;
    const totalFrameW = frameCfg.width;
    const totalW = artW + (matPx * 2) + (totalFrameW * 2);
    const totalH = artH + (matPx * 2) + (totalFrameW * 2);

    // Resize artwork with contain logic to prevent stretching/distortion.
    // Letterbox/pillarbox is transparent so only the frame/mat shows around it.
    const resizedArtwork = await sharp(artworkFile.path)
      .resize(artW, artH, {
        fit: 'contain',
        position: 'center',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Create frame + mat as a composed image
    const frameBuffer = await createFramedArtwork(
      resizedArtwork,
      artW,
      artH,
      totalW,
      totalH,
      frameCfg,
      matPx,
      getMatColor(matOption),
      aiFrameBuffer
    );

    // Position on environment (clamped) to avoid accidental overflow overrides.
    const safePosX = Math.min(100, Math.max(0, Number(posX) || 50));
    const safePosY = Math.min(100, Math.max(0, Number(posY) || 45));
    const left = Math.round((safePosX / 100) * envWidth - totalW / 2);
    const top = Math.round((safePosY / 100) * envHeight - totalH / 2);
    const clampedLeft = Math.max(0, Math.min(left, Math.max(0, envWidth - totalW)));
    const clampedTop = Math.max(0, Math.min(top, Math.max(0, envHeight - totalH)));

    // Composite
    const result = await sharp(envPath!)
      .composite([
        {
          input: frameBuffer,
          left: clampedLeft,
          top: clampedTop,
        }
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    const outputId = uuid();
    const outputPath = path.join(__dirname, '..', '..', 'outputs', `${outputId}.jpg`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, result);

    res.json({
      mockupUrl: `/outputs/${outputId}.jpg`,
      dimensions: { totalW, totalH, artW, artH },
    });

  } catch (error: any) {
    console.error('Compositing error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    // Cleanup temp files
    if (artworkFile?.path) {
      try { fs.unlinkSync(artworkFile.path); } catch {}
    }
    if (environmentFile?.path) {
      try { fs.unlinkSync(environmentFile.path); } catch {}
    }
    if (envTempFile && envPath) {
      try { fs.unlinkSync(envPath); } catch {}
    }
    if (aiFrameTempFile && aiFramePath) {
      try { fs.unlinkSync(aiFramePath); } catch {}
    }
  }
});

export { router as generateRouter };