import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Loader2, Save, Bookmark, Sparkles, ChevronDown, Search, Trash2 } from 'lucide-react';
import { useStudioStore, AiGeneratedFrame } from '../store/useStudioStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const USER_ID = 'demo-user'; // Replace with real auth

const FRAME_PROMPT_SUGGESTIONS = [
  'Rustic reclaimed barnwood with visible grain and nail holes',
  'Sleek brushed brass with beveled inner edge',
  'Hand-carved baroque gold leaf with floral motifs',
  'Minimalist white oak shadow box with deep reveal',
  'Oxidized copper with green patina and riveted corners',
  'Japanese wabi-sabi burnt cedar (shou sugi ban)',
  'Art deco geometric black and gold stepped frame',
  'Floating lucite/acrylic transparent modern frame',
  'Antique distressed silver with ornate scrollwork',
  'Raw concrete brutalist frame with smooth inner bevel',
  'Moroccan hand-painted ceramic tile mosaic border',
  'Italian marble frame with gold vein details',
];

export default function AiFrameGenerator() {
  const store = useStudioStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  const [searchQuery, setSearchQuery] = useState('');

  const loadSavedFrames = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ai/frames/saved/${USER_ID}`);
      store.setSavedFrames(response.data.frames);
    } catch (error) {
      console.error('Failed to load saved frames');
    }
  }, [store]);

  const handleGenerateFrame = async () => {
    if (!store.aiFramePrompt.trim()) {
      toast.error('Enter a description for your frame');
      return;
    }
    
    store.setIsGeneratingFrame(true);
    try {
      toast('Designing your frame...', { icon: '🖼️' });
      const response = await axios.post(`${API_URL}/api/ai/frames/generate`, {
        prompt: store.aiFramePrompt,
        userId: USER_ID,
        artworkWidth: store.artworkDimensions.width,
        artworkHeight: store.artworkDimensions.height,
        unit: store.artworkDimensions.unit,
      });
      
      store.setAiGeneratedFrame(response.data.frame);
      toast.success(`"${response.data.frame.name}" frame created!`);
      loadSavedFrames();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Frame generation failed');
    } finally {
      store.setIsGeneratingFrame(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (!store.aiFramePrompt.trim()) return;
    
    store.setIsGeneratingFrame(true);
    try {
      toast('Generating 3 frame variations...', { icon: '✨' });
      const response = await axios.post(`${API_URL}/api/ai/frames/generate-variations`, {
        prompt: store.aiFramePrompt,
        userId: USER_ID,
        artworkWidth: store.artworkDimensions.width,
        artworkHeight: store.artworkDimensions.height,
        unit: store.artworkDimensions.unit,
      });
      
      store.setAiFrameVariations(response.data.variations);
      toast.success('3 variations ready!');
    } catch (error: any) {
      toast.error('Variation generation failed');
    } finally {
      store.setIsGeneratingFrame(false);
    }
  };

  const handleDeleteFrame = async (frameId: string) => {
    try {
      await axios.delete(`${API_URL}/api/ai/frames/saved/${frameId}`, {
        data: { userId: USER_ID },
      });
      toast.success('Frame deleted');
      loadSavedFrames();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const selectSavedFrame = (frame: AiGeneratedFrame) => {
    store.setAiGeneratedFrame(frame);
    store.setFrame('none' as any);
    toast.success(`Selected "${frame.name}"`);
  };

  const filteredSaved = store.savedFrames.filter(f => 
    !searchQuery || 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'generate' 
              ? 'bg-gradient-to-r from-accent-gold to-accent-copper text-gallery-950' 
              : 'text-gallery-400 hover:text-gallery-200'
          }`}
        >
          <Wand2 className="w-4 h-4 inline mr-1.5" />
          Generate New
        </button>
        <button
          onClick={() => { setActiveTab('saved'); loadSavedFrames(); }}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'saved' 
              ? 'bg-gradient-to-r from-accent-gold to-accent-copper text-gallery-950' 
              : 'text-gallery-400 hover:text-gallery-200'
          }`}
        >
          <Bookmark className="w-4 h-4 inline mr-1.5" />
          Saved ({store.savedFrames.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'generate' ? (
          <motion.div
            key="generate"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {/* Prompt input */}
            <div className="relative">
              <textarea
                value={store.aiFramePrompt}
                onChange={(e) => store.setAiFramePrompt(e.target.value)}
                placeholder="Describe your dream frame... e.g., 'Weathered driftwood with a whitewash finish and rope-wrapped corners'"
                className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gallery-200 placeholder-gallery-600 resize-none focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-all"
              />
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="absolute bottom-3 right-3 text-xs text-gallery-500 hover:text-accent-gold flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Ideas
                <ChevronDown className={`w-3 h-3 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Prompt suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {FRAME_PROMPT_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          store.setAiFramePrompt(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="text-left text-xs px-3 py-2 rounded-lg border border-white/5 text-gallery-400 hover:text-gallery-200 hover:bg-white/5 hover:border-white/10 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleGenerateFrame}
                disabled={store.isGeneratingFrame || !store.aiFramePrompt.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {store.isGeneratingFrame ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-4 h-4" /> Generate Frame</>
                )}
              </button>
              <button
                onClick={handleGenerateVariations}
                disabled={store.isGeneratingFrame || !store.aiFramePrompt.trim()}
                className="btn-ghost flex items-center gap-2 disabled:opacity-40"
                title="Generate 3 variations"
              >
                <Sparkles className="w-4 h-4" /> ×3
              </button>
            </div>

            {/* Generated frame result */}
            {store.aiGeneratedFrame && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={`${API_URL}${store.aiGeneratedFrame.imageUrl}`}
                    alt={store.aiGeneratedFrame.name}
                    className="w-24 h-24 object-contain rounded-lg bg-white/5"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gallery-100">
                      {store.aiGeneratedFrame.name}
                    </h4>
                    <p className="text-xs text-gallery-500 mt-0.5">
                      {store.aiGeneratedFrame.material} · {store.aiGeneratedFrame.cornerStyle}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {store.aiGeneratedFrame.colorPrimary && (
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: store.aiGeneratedFrame.colorPrimary }}
                        />
                      )}
                      {store.aiGeneratedFrame.colorSecondary && (
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: store.aiGeneratedFrame.colorSecondary }}
                        />
                      )}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {store.aiGeneratedFrame.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gallery-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <Save className="w-3 h-3" />
                  Auto-saved to your library
                </div>
              </motion.div>
            )}

            {/* Variations */}
            {store.aiFrameVariations.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <p className="text-xs text-gallery-500 uppercase tracking-wider">Variations</p>
                <div className="grid grid-cols-3 gap-2">
                  {store.aiFrameVariations.map((variation, i) => (
                    <button
                      key={i}
                      onClick={() => store.setAiGeneratedFrame(variation as any)}
                      className="glass-panel p-2 text-center hover:border-accent-gold/30 transition-all group"
                    >
                      <img
                        src={variation.imageUrl}
                        alt={variation.name}
                        className="w-full aspect-square object-contain rounded-lg bg-white/5"
                      />
                      <p className="text-[10px] text-gallery-400 mt-1 truncate group-hover:text-gallery-200">
                        {variation.name}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-3"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gallery-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved frames..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gallery-200 placeholder-gallery-600 focus:outline-none focus:border-accent-gold/50 transition-all"
              />
            </div>

            {/* Saved frames grid */}
            <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredSaved.map((frame) => (
                <motion.div
                  key={frame.id}
                  layout
                  className={`relative glass-panel p-2 cursor-pointer group transition-all ${
                    store.aiGeneratedFrame?.id === frame.id 
                      ? 'border-accent-gold ring-1 ring-accent-gold/30' 
                      : 'hover:border-white/20'
                  }`}
                  onClick={() => selectSavedFrame(frame)}
                >
                  <img
                    src={`${API_URL}${frame.thumbnailUrl || frame.imageUrl}`}
                    alt={frame.name}
                    className="w-full aspect-square object-contain rounded-lg bg-white/5"
                  />
                  <p className="text-[10px] text-gallery-300 mt-1 truncate">{frame.name}</p>
                  <p className="text-[9px] text-gallery-600 truncate">{frame.material}</p>
                  
                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFrame(frame.id); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 className="w-2.5 h-2.5 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>

            {filteredSaved.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gallery-500">No saved frames yet</p>
                <p className="text-xs text-gallery-600 mt-1">Generate your first AI frame above</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}