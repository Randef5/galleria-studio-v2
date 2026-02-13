import { motion } from 'framer-motion';
import { useStudioStore, FrameStyle, MatOption } from '../store/useStudioStore';
import * as Slider from '@radix-ui/react-slider';
import { Frame, Wand2, Grid3X3 } from 'lucide-react';
import AiFrameGenerator from './AiFrameGenerator';

const FRAME_OPTIONS: { id: FrameStyle; name: string; borderWidth: string; borderStyle: string }[] = [
  { id: 'none', name: 'No Frame', borderWidth: '0px', borderStyle: 'none' },
  { id: 'thin-black', name: 'Thin Black', borderWidth: '3px', borderStyle: 'solid' },
  { id: 'thin-white', name: 'Thin White', borderWidth: '3px', borderStyle: 'solid' },
  { id: 'classic-gold', name: 'Classic Gold', borderWidth: '8px', borderStyle: 'solid' },
  { id: 'classic-silver', name: 'Classic Silver', borderWidth: '8px', borderStyle: 'solid' },
  { id: 'ornate-gold', name: 'Ornate Gold', borderWidth: '16px', borderStyle: 'double' },
  { id: 'ornate-dark', name: 'Ornate Dark', borderWidth: '16px', borderStyle: 'double' },
  { id: 'natural-oak', name: 'Natural Oak', borderWidth: '10px', borderStyle: 'solid' },
  { id: 'natural-walnut', name: 'Walnut', borderWidth: '10px', borderStyle: 'solid' },
  { id: 'natural-maple', name: 'Maple', borderWidth: '10px', borderStyle: 'solid' },
  { id: 'floating-white', name: 'Float White', borderWidth: '2px', borderStyle: 'solid' },
  { id: 'floating-black', name: 'Float Black', borderWidth: '2px', borderStyle: 'solid' },
  { id: 'shadow-box', name: 'Shadow Box', borderWidth: '20px', borderStyle: 'solid' },
  { id: 'canvas-wrap', name: 'Canvas Wrap', borderWidth: '0px', borderStyle: 'none' },
];

const MAT_OPTIONS: { id: MatOption; name: string; color: string }[] = [
  { id: 'none', name: 'No Mat', color: 'transparent' },
  { id: 'white', name: 'White', color: '#ffffff' },
  { id: 'cream', name: 'Cream', color: '#fdf6e3' },
  { id: 'black', name: 'Black', color: '#1a1a1a' },
  { id: 'grey', name: 'Grey', color: '#9ca3af' },
];

const FRAME_COLORS: Record<string, string> = {
  'none': 'transparent',
  'thin-black': '#111111',
  'thin-white': '#f5f5f5',
  'classic-gold': '#b8860b',
  'classic-silver': '#c0c0c0',
  'ornate-gold': '#a67c00',
  'ornate-dark': '#2d2d2d',
  'natural-oak': '#c19a6b',
  'natural-walnut': '#5c3317',
  'natural-maple': '#f2d2a9',
  'floating-white': '#f5f5f5',
  'floating-black': '#111111',
  'shadow-box': '#1a1a1a',
  'canvas-wrap': 'transparent',
};

export default function FrameSelector() {
  const { frameStyle, setFrame, matOption, setMat, matWidth, setMatWidth, artworkPreview, frameMode, setFrameMode } = useStudioStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-gallery-100 flex items-center gap-2">
          <Frame className="w-5 h-5 text-accent-gold" />
          Frame & Mat
        </h2>

        {/* Mode toggle: Preset vs AI */}
        <div className="flex gap-1 p-0.5 bg-white/5 rounded-lg">
          <button
            onClick={() => setFrameMode('preset')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all flex items-center gap-1.5 ${
              frameMode === 'preset'
                ? 'bg-white/10 text-gallery-200 font-medium'
                : 'text-gallery-500 hover:text-gallery-300'
            }`}
          >
            <Grid3X3 className="w-3 h-3" />
            Presets
          </button>
          <button
            onClick={() => setFrameMode('ai-generate')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all flex items-center gap-1.5 ${
              frameMode === 'ai-generate'
                ? 'bg-gradient-to-r from-accent-gold/20 to-accent-copper/20 text-accent-gold font-medium'
                : 'text-gallery-500 hover:text-gallery-300'
            }`}
          >
            <Wand2 className="w-3 h-3" />
            AI Create
          </button>
        </div>
      </div>

      {/* Conditional rendering based on mode */}
      {frameMode === 'preset' ? (
        <>
          {/* Live preview */}
          {artworkPreview && (
            <div className="flex justify-center py-4">
              <div
                className="transition-all duration-500 max-w-[200px]"
                style={{
                  border: frameStyle === 'none' ? 'none' : 
                    `${FRAME_OPTIONS.find(f => f.id === frameStyle)?.borderWidth} ${FRAME_OPTIONS.find(f => f.id === frameStyle)?.borderStyle} ${FRAME_COLORS[frameStyle]}`,
                  padding: matOption !== 'none' ? `${matWidth * 4}px` : '0',
                  backgroundColor: matOption !== 'none' ? MAT_OPTIONS.find(m => m.id === matOption)?.color : 'transparent',
                  boxShadow: frameStyle === 'shadow-box' ? 'inset 0 0 20px rgba(0,0,0,0.3)' : 
                           frameStyle === 'floating-white' || frameStyle === 'floating-black' ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                <img 
                  src={artworkPreview} 
                  alt="Preview" 
                  className="w-full h-auto block"
                  style={{
                    boxShadow: frameStyle === 'canvas-wrap' ? '4px 4px 8px rgba(0,0,0,0.3)' : 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Frame options */}
          <div>
            <p className="text-xs text-gallery-500 mb-3 uppercase tracking-wider">Frame Style</p>
            <div className="grid grid-cols-4 gap-2">
              {FRAME_OPTIONS.map((f) => (
                <motion.button
                  key={f.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFrame(f.id)}
                  className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                    frameStyle === f.id
                      ? 'border-accent-gold/50 bg-accent-gold/10'
                      : 'border-white/5 hover:border-white/15 hover:bg-white/5'
                  }`}
                >
                  {/* Mini frame preview */}
                  <div className="w-10 h-12 flex items-center justify-center">
                    <div
                      className="w-7 h-9 bg-gallery-400/30"
                      style={{
                        border: f.id === 'none' ? '1px dashed rgba(255,255,255,0.2)' : 
                          `${parseInt(f.borderWidth) > 10 ? '4px' : parseInt(f.borderWidth) > 5 ? '3px' : '1px'} ${f.borderStyle} ${FRAME_COLORS[f.id]}`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-gallery-400 leading-tight text-center">{f.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mat options */}
          {frameStyle !== 'none' && frameStyle !== 'canvas-wrap' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <p className="text-xs text-gallery-500 mb-3 uppercase tracking-wider">Mat</p>
                <div className="flex gap-2">
                  {MAT_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMat(m.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs ${
                        matOption === m.id
                          ? 'border-accent-gold/50 bg-accent-gold/10 text-accent-gold'
                          : 'border-white/10 text-gallery-400 hover:border-white/20'
                      }`}
                    >
                      <div 
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: m.color === 'transparent' ? 'rgba(255,255,255,0.05)' : m.color }}
                      />
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {matOption !== 'none' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gallery-400">Mat Width</span>
                    <span className="text-gallery-200 font-medium">{matWidth}"</span>
                  </div>
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    value={[matWidth]}
                    onValueChange={([v]) => setMatWidth(v)}
                    min={1}
                    max={5}
                    step={0.5}
                  >
                    <Slider.Track className="bg-white/10 relative grow rounded-full h-1.5">
                      <Slider.Range className="absolute bg-gradient-to-r from-accent-gold to-accent-copper rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg cursor-grab" />
                  </Slider.Root>
                </div>
              )}
            </motion.div>
          )}
        </>
      ) : (
        <AiFrameGenerator />
      )}
    </div>
  );
}