import { Router, Request, Response } from 'express';

const router = Router();

// Extended health check with env verification
router.get('/', (_req: Request, res: Response) => {
  const envStatus = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing',
    DATABASE_URL: process.env.DATABASE_URL ? '✓ Set' : '✗ Missing',
    CLIENT_URL: process.env.CLIENT_URL || 'Using default (localhost:3000)',
    NODE_ENV: process.env.NODE_ENV || 'not set',
  };

  const allClear = process.env.OPENAI_API_KEY && process.env.DATABASE_URL;

  res.json({
    status: allClear ? 'ok' : 'missing-env',
    timestamp: new Date().toISOString(),
    environment: envStatus,
    hint: !allClear ? 'Add missing env vars in Render dashboard' : undefined,
  });
});

// Test OpenAI connection
router.get('/test-openai', async (_req: Request, res: Response) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  try {
    const OpenAI = await import('openai');
    const openai = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });
    
    // Simple models list call to verify API key works
    const models = await openai.models.list();
    
    res.json({
      status: 'ok',
      message: 'OpenAI API key is valid',
      availableModels: models.data.length,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'OpenAI API key invalid or expired',
      details: error.message,
    });
  }
});

// Test database connection
router.get('/test-db', async (_req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as test`;
    await prisma.$disconnect();
    
    res.json({ status: 'ok', message: 'Database connection successful' });
  } catch (error: any) {
    res.status(500).json({
      error: 'Database connection failed',
      details: error.message,
    });
  }
});

export { router as healthRouter };