import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { generateRouter } from './routes/generate';
import { aiRouter } from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));

app.use(express.json({ limit: '50mb' }));

// Ensure upload/output directories exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const outputsDir = path.join(__dirname, '..', 'outputs');
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(outputsDir, { recursive: true });

// Static files for serving mockups
app.use('/outputs', express.static(outputsDir));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/generate', generateRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/health', (_req: Request, res: Response) => res.json({ 
  status: 'ok',
  timestamp: new Date().toISOString()
}));

app.listen(PORT, () => {
  console.log(`🎨 Galleria Studio API running on port ${PORT}`);
});