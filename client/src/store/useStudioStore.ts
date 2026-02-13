import { create } from 'zustand';

export type FrameStyle = 'none' | 'thin-black' | 'thin-white' | 'classic-gold' | 'classic-silver' | 'ornate-gold' | 'ornate-dark' | 'natural-oak' | 'natural-walnut' | 'natural-maple' | 'floating-white' | 'floating-black' | 'shadow-box' | 'canvas-wrap';
export type MatOption = 'none' | 'white' | 'cream' | 'black' | 'grey';
export type EnvironmentCategory = 'living-room' | 'bedroom' | 'office' | 'gallery' | 'cafe' | 'restaurant' | 'hotel' | 'retail' | 'hallway' | 'outdoor' | 'ai-suggested';

export interface ArtworkDimensions {
  width: number;
  height: number;
  unit: 'in' | 'cm';
}

export interface TemplateConfig {
  id: string;
  name: string;
  category: EnvironmentCategory;
  thumbnail: string;
  prompt: string;
  wallColor?: string;
  lighting?: string;
}

// NEW: AI Generated Frame Types
export interface AiGeneratedFrame {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
  thumbnailUrl?: string;
  borderWidth: number;
  cornerStyle: string;
  material?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  tags: string[];
  createdAt: string;
}

// NEW: AI Generated Environment Types  
export interface AiGeneratedEnvironment {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  wallColor?: string;
  lighting?: string;
  mood?: string;
  tags: string[];
  createdAt: string;
  description?: string; // FIX: Added missing property
}

// NEW: Mode Types
export type FrameMode = 'preset' | 'ai-generate' | 'saved';
export type EnvironmentMode = 'preset' | 'ai-auto' | 'ai-prompt' | 'saved';

interface StudioState {
  // Artwork
  artworkFile: File | null;
  artworkPreview: string | null;
  artworkDimensions: ArtworkDimensions;
  // Frame
  frameStyle: FrameStyle;
  matOption: MatOption;
  matWidth: number;
  // Environment
  selectedTemplate: TemplateConfig | null;
  environmentCategory: EnvironmentCategory | null;
  useAiSuggestion: boolean;
  aiPrompt: string | null;
  // Output
  generatedMockup: string | null;
  isGenerating: boolean;
  generationProgress: number;
  // NEW: Frame Mode
  frameMode: FrameMode;
  aiFramePrompt: string;
  aiGeneratedFrame: AiGeneratedFrame | null;
  aiFrameVariations: AiGeneratedFrame[];
  savedFrames: AiGeneratedFrame[];
  isGeneratingFrame: boolean;
  // NEW: Environment Mode
  environmentMode: EnvironmentMode;
  aiEnvironmentPrompt: string;
  aiGeneratedEnvironment: AiGeneratedEnvironment | null;
  aiEnvironmentVariations: AiGeneratedEnvironment[];
  savedEnvironments: AiGeneratedEnvironment[];
  isGeneratingEnvironment: boolean;
  // Actions
  setArtwork: (file: File, preview: string) => void;
  setDimensions: (dims: Partial<ArtworkDimensions>) => void;
  setFrame: (style: FrameStyle) => void;
  setMat: (option: MatOption) => void;
  setMatWidth: (width: number) => void;
  setTemplate: (template: TemplateConfig) => void;
  setEnvironmentCategory: (cat: EnvironmentCategory) => void;
  setUseAi: (use: boolean) => void;
  setAiPrompt: (prompt: string) => void;
  setGeneratedMockup: (url: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  reset: () => void;
  // NEW: Frame Mode Actions
  setFrameMode: (mode: FrameMode) => void;
  setAiFramePrompt: (prompt: string) => void;
  setAiGeneratedFrame: (frame: AiGeneratedFrame | null) => void;
  setAiFrameVariations: (variations: AiGeneratedFrame[]) => void;
  setSavedFrames: (frames: AiGeneratedFrame[]) => void;
  setIsGeneratingFrame: (isGenerating: boolean) => void;
  // NEW: Environment Mode Actions
  setEnvironmentMode: (mode: EnvironmentMode) => void;
  setAiEnvironmentPrompt: (prompt: string) => void;
  setAiGeneratedEnvironment: (env: AiGeneratedEnvironment | null) => void;
  setAiEnvironmentVariations: (variations: AiGeneratedEnvironment[]) => void;
  setSavedEnvironments: (envs: AiGeneratedEnvironment[]) => void;
  setIsGeneratingEnvironment: (isGenerating: boolean) => void;
}

const initialDimensions: ArtworkDimensions = {
  width: 24,
  height: 36,
  unit: 'in',
};

export const useStudioStore = create<StudioState>((set) => ({
  // Initial state
  artworkFile: null,
  artworkPreview: null,
  artworkDimensions: initialDimensions,
  frameStyle: 'none',
  matOption: 'none',
  matWidth: 2,
  selectedTemplate: null,
  environmentCategory: null,
  useAiSuggestion: true,
  aiPrompt: null,
  generatedMockup: null,
  isGenerating: false,
  generationProgress: 0,
  // NEW: Frame Mode - Initial
  frameMode: 'preset',
  aiFramePrompt: '',
  aiGeneratedFrame: null,
  aiFrameVariations: [],
  savedFrames: [],
  isGeneratingFrame: false,
  // NEW: Environment Mode - Initial
  environmentMode: 'preset',
  aiEnvironmentPrompt: '',
  aiGeneratedEnvironment: null,
  aiEnvironmentVariations: [],
  savedEnvironments: [],
  isGeneratingEnvironment: false,
  // Actions
  setArtwork: (file, preview) => set({ artworkFile: file, artworkPreview: preview }),
  setDimensions: (dims) => set((state) => ({ 
    artworkDimensions: { ...state.artworkDimensions, ...dims } 
  })),
  setFrame: (style) => set({ frameStyle: style }),
  setMat: (option) => set({ matOption: option }),
  setMatWidth: (width) => set({ matWidth: width }),
  setTemplate: (template) => set({ selectedTemplate: template }),
  setEnvironmentCategory: (cat) => set({ environmentCategory: cat }),
  setUseAi: (use) => set({ useAiSuggestion: use }),
  setAiPrompt: (prompt) => set({ aiPrompt: prompt }),
  setGeneratedMockup: (url) => set({ generatedMockup: url }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  reset: () => set({
    artworkFile: null,
    artworkPreview: null,
    artworkDimensions: initialDimensions,
    frameStyle: 'none',
    matOption: 'none',
    matWidth: 2,
    selectedTemplate: null,
    environmentCategory: null,
    useAiSuggestion: true,
    aiPrompt: null,
    generatedMockup: null,
    isGenerating: false,
    generationProgress: 0,
    frameMode: 'preset',
    aiFramePrompt: '',
    aiGeneratedFrame: null,
    aiFrameVariations: [],
    environmentMode: 'preset',
    aiEnvironmentPrompt: '',
    aiGeneratedEnvironment: null,
    aiEnvironmentVariations: [],
  }),
  // NEW: Frame Mode Actions
  setFrameMode: (mode) => set({ frameMode: mode }),
  setAiFramePrompt: (prompt) => set({ aiFramePrompt: prompt }),
  setAiGeneratedFrame: (frame) => set({ aiGeneratedFrame: frame }),
  setAiFrameVariations: (variations) => set({ aiFrameVariations: variations }),
  setSavedFrames: (frames) => set({ savedFrames: frames }),
  setIsGeneratingFrame: (isGenerating) => set({ isGeneratingFrame: isGenerating }),
  // NEW: Environment Mode Actions
  setEnvironmentMode: (mode) => set({ environmentMode: mode }),
  setAiEnvironmentPrompt: (prompt) => set({ aiEnvironmentPrompt: prompt }),
  setAiGeneratedEnvironment: (env) => set({ aiGeneratedEnvironment: env }),
  setAiEnvironmentVariations: (variations) => set({ aiEnvironmentVariations: variations }),
  setSavedEnvironments: (envs) => set({ savedEnvironments: envs }),
  setIsGeneratingEnvironment: (isGenerating) => set({ isGeneratingEnvironment: isGenerating }),
}));