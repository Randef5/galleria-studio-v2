import { useStudioStore } from '../store/useStudioStore';
import * as Slider from '@radix-ui/react-slider';
import { Ruler, RotateCcw } from 'lucide-react';

const PRESETS = [
  { label: '8×10"', w: 8, h: 10 },
  { label: '11×14"', w: 11, h: 14 },
  { label: '16×20"', w: 16, h: 20 },
  { label: '18×24"', w: 18, h: 24 },
  { label: '24×36"', w: 24, h: 36 },
  { label: '30×40"', w: 30, h: 40 },
  { label: '36×48"', w: 36, h: 48 },
  { label: '40×60"', w: 40, h: 60 },
  { label: '12×12"', w: 12, h: 12 },
  { label: '20×20"', w: 20, h: 20 },
  { label: '30×30"', w: 30, h: 30 },
];

export default function DimensionsPanel() {
  const { artworkDimensions, setDimensions } = useStudioStore();
  const { width, height, unit } = artworkDimensions;

  const swapOrientation = () => setDimensions({ width: height, height: width });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-gallery-100 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-accent-gold" />
          Dimensions
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDimensions({ unit: unit === 'in' ? 'cm' : 'in' })}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gallery-400 hover:text-gallery-200 hover:border-white/20 transition-all"
          >
            {unit === 'in' ? 'inches' : 'cm'}
          </button>
          <button
            onClick={swapOrientation}
            className="p-1.5 rounded-lg border border-white/10 text-gallery-400 hover:text-gallery-200 hover:border-white/20 transition-all"
            title="Swap orientation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Width slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gallery-400">Width</span>
          <span className="text-gallery-200 font-medium">{width} {unit}</span>
        </div>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[width]}
          onValueChange={([v]) => setDimensions({ width: v })}
          min={unit === 'in' ? 4 : 10}
          max={unit === 'in' ? 72 : 183}
          step={unit === 'in' ? 1 : 1}
        >
          <Slider.Track className="bg-white/10 relative grow rounded-full h-1.5">
            <Slider.Range className="absolute bg-gradient-to-r from-accent-gold to-accent-copper rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg shadow-black/30 hover:bg-accent-gold focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-colors cursor-grab" />
        </Slider.Root>
      </div>

      {/* Height slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gallery-400">Height</span>
          <span className="text-gallery-200 font-medium">{height} {unit}</span>
        </div>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[height]}
          onValueChange={([v]) => setDimensions({ height: v })}
          min={unit === 'in' ? 4 : 10}
          max={unit === 'in' ? 72 : 183}
          step={unit === 'in' ? 1 : 1}
        >
          <Slider.Track className="bg-white/10 relative grow rounded-full h-1.5">
            <Slider.Range className="absolute bg-gradient-to-r from-accent-gold to-accent-copper rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg shadow-black/30 hover:bg-accent-gold focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-colors cursor-grab" />
        </Slider.Root>
      </div>

      {/* Presets grid */}
      <div>
        <p className="text-xs text-gallery-500 mb-2 uppercase tracking-wider">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setDimensions({ width: p.w, height: p.h, unit: 'in' })}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                width === p.w && height === p.h
                  ? 'border-accent-gold/50 bg-accent-gold/10 text-accent-gold'
                  : 'border-white/10 text-gallery-400 hover:border-white/20 hover:text-gallery-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual aspect ratio preview */}
      <div className="flex items-center justify-center py-4">
        <div
          className="border border-white/20 bg-white/5 transition-all duration-500"
          style={{
            width: `${Math.min(120, (width / Math.max(width, height)) * 120)}px`,
            height: `${Math.min(120, (height / Math.max(width, height)) * 120)}px`,
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gallery-500">
            {width}×{height}
          </div>
        </div>
      </div>
    </div>
  );
}