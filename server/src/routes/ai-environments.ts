import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

// Analyze artwork and suggest environment prompt
router.post('/analyze-artwork', async (req: Request, res: Response) => {
  try {
    const { width, height, unit, frameStyle, frameDescription, frameMaterial, framePrompt, matOption } = req.body;

    // Build frame context for the prompt
    let frameContext = '';
    if (frameStyle === 'ai-generated' && framePrompt) {
      frameContext = `The artwork uses a custom AI-generated frame: "${frameDescription}". Frame prompt: ${framePrompt}`;
    } else if (frameDescription) {
      frameContext = `The artwork uses a ${frameStyle} frame made of ${frameMaterial || 'wood'} (${frameDescription}).`;
    }

    const matContext = matOption !== 'none' ? ` It has a ${matOption} mat.` : '';

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert interior designer and art curator. Analyze artwork specifications and create a matching environment description.

The environment should:
1. Feature a clean wall straight-on where artwork can be hung (center of image)
2. Match the frame style and material (${frameDescription || 'standard frame'})
3. Have appropriate room context that complements the artwork size
4. Use lighting and colors that make the frame stand out

Respond in JSON:
{
  "roomType": "living room|bedroom|gallery|office|foyer|dining room",
  "styleVibe": "modern|traditional|minimalist|cozy|luxury|industrial|rustic",
  "colorPalette": "description of colors",
  "lighting": "lighting description",
  "generationPrompt": "Complete DALL-E prompt for the environment. MUST specify: straight-on camera view facing wall, centered perspective, photorealistic interior. Include frame context: ${frameContext}${matContext}"
}`
        },
        {
          role: 'user',
          content: `Create an environment for artwork sized ${width}x${height} ${unit}. ${frameContext}${matContext}`
        }
      ],
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');
    
    res.json(analysis);
  } catch (error: any) {
    console.error('Artwork analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate a single environment
function getDalleSizeForAspect(artworkWidth: number, artworkHeight: number): '1024x1024' | '1792x1024' | '1024x1792' {
  const ratio = artworkWidth / artworkHeight;
  if (Math.abs(1 - ratio) < 0.12) return '1024x1024';
  return ratio > 1 ? '1792x1024' : '1024x1792';
}

function getOpeningSpec(artworkWidth: number, artworkHeight: number, unit: string) {
  const ratio = (artworkWidth / artworkHeight).toFixed(3);
  return `${artworkWidth}×${artworkHeight} ${unit} (aspect ratio ${ratio}:1)`;
}

async function generateSingleEnvironment(
  basePrompt: string,
  artworkWidth: number,
  artworkHeight: number,
  unit: string,
  variationIndex: number,
  variationStyle?: string
): Promise<any> {
  const openingSpec = getOpeningSpec(artworkWidth, artworkHeight, unit);
  const dalleSize = getDalleSizeForAspect(artworkWidth, artworkHeight);

  // Step 1: Use GPT-4o to refine the environment prompt
  const refinementResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert interior photographer and 3D artist. Create a detailed prompt for generating a photorealistic room environment suitable for hanging artwork.

CRITICAL REQUIREMENTS for the DALL-E prompt:
- Camera: Straight-on view, directly facing the main wall (90 degree angle, flat perspective)
- Wall: Clean, well-lit main wall in the CENTER of the image where artwork will hang
- MUST include a clearly visible rectangular artwork placeholder opening sized/proportioned for ${openingSpec}
- Opening should be flat and planar to wall, with subtle realistic shadow/depth (no distorted perspective)
- Room: Full room context visible but the wall and placeholder are the focus
- Style: Photorealistic interior photography, 8K quality
- Lighting: Natural and appropriate for artwork display
- NO existing artwork, text, mirror reflections, or decorative objects occupying the placeholder area

Also provide:
- A short name for this environment (max 30 chars)
- A brief description (max 100 chars)
- Category: e.g., living-room, bedroom, gallery, office
- Mood: e.g., cozy, bright, dramatic, serene
- Lighting: e.g., natural light, warm ambient, cool daylight
- Wall color: e.g., white, cream, light gray

Respond in JSON format only.`
      },
      {
        role: 'user',
        content: `Create ${variationStyle ? `a ${variationStyle} variation of` : 'an environment for'}: "${basePrompt}". The artwork to be hung is ${openingSpec}. Include a centered rectangular opening reserved for this artwork size.${variationIndex > 0 ? ` Make this variation ${variationIndex + 1} distinctly different in style.` : ''}`
      }
    ],
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  const refinement = JSON.parse(refinementResponse.choices[0].message.content || '{}');
  const refinedPrompt = refinement.dallePrompt || refinement.generationPrompt || refinement.prompt || basePrompt;

  // Step 2: Generate the environment image with DALL-E 3
  const dalleResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `${refinedPrompt}. The camera looks straight-on at the wall (90 degrees, flat perspective). Include a centered rectangular opening sized for ${openingSpec}, flat and undistorted, reserved for artwork placement. No artwork in the opening. Photorealistic interior photography, 8K, professional lighting.`,
    n: 1,
    size: dalleSize,
    quality: 'hd',
    style: 'natural',
  });

  if (!dalleResponse.data || dalleResponse.data.length === 0 || !dalleResponse.data[0].url) {
    throw new Error('DALL-E returned no image data');
  }

  const generatedImageUrl = dalleResponse.data[0].url;

  // Step 3: Download and process the image
  const imageResponse = await fetch(generatedImageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.status}`);
  }
  
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  const envsDir = path.join(process.cwd(), 'public', 'environments');
  fs.mkdirSync(envsDir, { recursive: true });

  const envId = uuid();
  const filename = `${envId}.png`;
  const thumbFilename = `${envId}-thumb.png`;

  // Save full-size
  await sharp(imageBuffer)
    .resize(2048, 2048, { fit: 'inside' })
    .png()
    .toFile(path.join(envsDir, filename));

  // Generate thumbnail
  await sharp(imageBuffer)
    .resize(512, 512, { fit: 'inside' })
    .png()
    .toFile(path.join(envsDir, thumbFilename));

  const imageUrl = `/environments/${filename}`;
  const thumbnailUrl = `/environments/${thumbFilename}`;

  return {
    id: envId,
    name: refinement.name || `${basePrompt.slice(0, 30)}...`,
    description: refinement.description || `${basePrompt.slice(0, 100)}...`,
    dallePrompt: refinedPrompt,
    category: refinement.category || 'custom',
    mood: refinement.mood || 'neutral',
    lighting: refinement.lighting || 'natural',
    wallColor: refinement.wallColor || 'white',
    imageUrl,
    thumbnailUrl,
    generatedImageUrl,
  };
}

// Generate environment from text prompt
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, userId, artworkWidth, artworkHeight, unit } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await generateSingleEnvironment(
      prompt,
      artworkWidth,
      artworkHeight,
      unit,
      0
    );

    // Save to database if userId provided
    let savedEnvironment = null;
    if (userId) {
      const slug = `environment-${Date.now()}-${result.id.slice(0, 6)}`;
      
      savedEnvironment = await prisma.savedEnvironment.create({
        data: {
          id: result.id,
          userId,
          name: result.name,
          slug,
          prompt,
          category: result.category,
          imageUrl: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
          tags: [],
          wallColor: result.wallColor,
          lighting: result.lighting,
          roomType: result.category,
          mood: result.mood,
        },
      });
    }

    res.json({
      environment: savedEnvironment || result,
      imageUrl: result.imageUrl,
      thumbnailUrl: result.thumbnailUrl,
      generatedImageUrl: result.generatedImageUrl,
    });

  } catch (error: any) {
    console.error('Environment generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate 3 environment variations
router.post('/generate-variations', async (req: Request, res: Response) => {
  try {
    const { prompt, userId, artworkWidth, artworkHeight, unit } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const variationStyles = ['luxurious', 'minimalist', 'cozy'];
    
    const variations = await Promise.all(
      variationStyles.map((style, index) =>
        generateSingleEnvironment(prompt, artworkWidth, artworkHeight, unit, index, style)
      )
    );

    res.json({ variations });

  } catch (error: any) {
    console.error('Variation generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List user's saved environments
router.get('/saved/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '20', search } = req.query;

    const where: any = { userId };
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { prompt: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } },
      ];
    }

    const [environments, total] = await Promise.all([
      prisma.savedEnvironment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.savedEnvironment.count({ where }),
    ]);

    res.json({
      environments,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a saved environment
router.delete('/saved/:envId', async (req: Request, res: Response) => {
  try {
    const { envId } = req.params;
    const { userId } = req.body;

    await prisma.savedEnvironment.deleteMany({
      where: { id: envId, userId }
    });

    // Delete files
    const envsDir = path.join(process.cwd(), 'public', 'environments');
    ['.png', '-thumb.png'].forEach(ext => {
      const filePath = path.join(envsDir, `${envId}${ext}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.json({ success: true });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Increment usage count
router.post('/saved/:envId/use', async (req: Request, res: Response) => {
  try {
    await prisma.savedEnvironment.update({
      where: { id: req.params.envId },
      data: { usageCount: { increment: 1 } },
    });

    res.json({ success: true });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as aiEnvironmentsRouter };