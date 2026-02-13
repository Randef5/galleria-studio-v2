import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
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
fs.mkdirSync('uploads', { recursive: true });
fs.mkdirSync('outputs', { recursive: true });

// Static files for serving mockups
app.use('/outputs', express.static('outputs'));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/generate', generateRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/health', (_, res) => res.json({ 
  status: 'ok',
  timestamp: new Date().toISOString()
}));

app.listen(PORT, () => {
  console.log(`🎨 Galleria Studio API running on port ${PORT}`);
});