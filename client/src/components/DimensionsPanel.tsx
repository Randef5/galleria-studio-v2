import { useStudioStore } from '../store/useStudioStore';
import * as Slider from '@radix-ui/react-slider';
import { Ruler, RotateCcw } from 'lucide-react';

const PRESETS_CM = [
  { label: '30×30 cm', w: 30, h: 30 },
  { label: '40×30 cm', w: 40, h: 30 },
  { label: '50×40 cm', w: 50, h: 40 },
  { label: '60×40 cm', w: 60, h: 40 },
  { label: '70×50 cm', w: 70, h: 50 },
  { label: '80×60 cm', w: 80, h: 60 },
  { label: '100×70 cm', w: 100, h: 70 },
  { label: '120×80 cm', w: 120, h: 80 },
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
        <button
          onClick={swapOrientation}
          className="p-1.5 rounded-lg border border-white/10 text-gallery-400 hover:text-gallery-200 hover:border-white/20 transition-all"
          title="Swap orientation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-gallery-500 uppercase tracking-wider">Units: centimeters (cm)</div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gallery-400">Width</span>
          <span className="text-gallery-200 font-medium">{width} {unit}</span>
        </div>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[width]}
          onValueChange={([v]) => setDimensions({ width: v })}
          min={20}
          max={200}
          step={1}
        >
          <Slider.Track className="bg-white/10 relative grow rounded-full h-1.5">
            <Slider.Range className="absolute bg-gradient-to-r from-accent-gold to-accent-copper rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg shadow-black/30 hover:bg-accent-gold focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-colors cursor-grab" />
        </Slider.Root>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gallery-400">Height</span>
          <span className="text-gallery-200 font-medium">{height} {unit}</span>
        </div>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[height]}
          onValueChange={([v]) => setDimensions({ height: v })}
          min={20}
          max={200}
          step={1}
        >
          <Slider.Track className="bg-white/10 relative grow rounded-full h-1.5">
            <Slider.Range className="absolute bg-gradient-to-r from-accent-gold to-accent-copper rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg shadow-black/30 hover:bg-accent-gold focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-colors cursor-grab" />
        </Slider.Root>
      </div>

      <div>
        <p className="text-xs text-gallery-500 mb-2 uppercase tracking-wider">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS_CM.map((p) => (
            <button
              key={p.label}
              onClick={() => setDimensions({ width: p.w, height: p.h, unit: 'cm' })}
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
