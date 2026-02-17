import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Loader2, Bookmark, Sparkles, Search, Trash2, ChevronDown, Globe, Check } from 'lucide-react';
import { useStudioStore, AiGeneratedEnvironment } from '../store/useStudioStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const USER_ID = 'demo-user';

const ENV_PROMPT_SUGGESTIONS = [
  'A sun-drenched Tuscan villa with terracotta floors and arched windows overlooking olive groves',
  'A moody Brooklyn loft with exposed brick, steel beams, and a vintage leather sofa',
  'A pristine white Scandinavian gallery with polished concrete floors and skylights',
  'A cozy Japanese teahouse with tatami mats, shoji screens, and soft natural light',
  'A glamorous Art Deco penthouse with velvet furniture, brass details, and Manhattan skyline views',
  'A Mediterranean rooftop terrace with whitewashed walls, bougainvillea, and ocean sunset',
  'A dark academia library with floor-to-ceiling mahogany bookshelves and green banker lamps',
  'A futuristic minimalist space with curved white walls, LED strip lighting, and a single chair',
  'A rustic French château hallway with gilded mirrors, parquet floors, and crystal chandeliers',
  'A tropical Bali resort villa with open-air design, teak furniture, and jungle views',
  'A converted church with stained glass windows, stone walls, and dramatic overhead lighting',
  'A high-end Parisian apartment with herringbone floors, marble fireplace, and silk curtains',
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'living-room', label: 'Living' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'office', label: 'Office' },
  { id: 'cafe', label: 'Café' },
  { id: 'hotel', label: 'Hotel' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'custom', label: 'Custom' },
];

export default function AiEnvironmentGenerator() {
  const store = useStudioStore();
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadSavedEnvironments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await axios.get(
        `${API_URL}/api/ai/environments/saved/${USER_ID}?${params}`
      );
      store.setSavedEnvironments(response.data.environments);
    } catch (error) {
      console.error('Failed to load environments');
    }
  }, [store, categoryFilter, searchQuery]);

  useEffect(() => {
    loadSavedEnvironments();
  }, [loadSavedEnvironments]);

  const handleGenerate = async () => {
    if (!store.aiEnvironmentPrompt.trim()) {
      toast.error('Describe the environment you want');
      return;
    }
    
    store.setIsGeneratingEnvironment(true);
    try {
      toast('Creating your environment...', { icon: '🏠' });
      const response = await axios.post(`${API_URL}/api/ai/environments/generate`, {
        prompt: store.aiEnvironmentPrompt,
        userId: USER_ID,
        artworkWidth: store.artworkDimensions.width,
        artworkHeight: store.artworkDimensions.height,
        unit: store.artworkDimensions.unit,
      });
      
      store.setAiGeneratedEnvironment(response.data.environment);
      toast.success(`"${response.data.environment.name}" created!`);
      loadSavedEnvironments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Generation failed');
    } finally {
      store.setIsGeneratingEnvironment(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (!store.aiEnvironmentPrompt.trim()) return;
    
    store.setIsGeneratingEnvironment(true);
    try {
      toast('Generating 3 environment variations...', { icon: '✨' });
      const response = await axios.post(`${API_URL}/api/ai/environments/generate-variations`, {
        prompt: store.aiEnvironmentPrompt,
        userId: USER_ID,
        artworkWidth: store.artworkDimensions.width,
        artworkHeight: store.artworkDimensions.height,
        unit: store.artworkDimensions.unit,
      });
      
      store.setAiEnvironmentVariations(response.data.variations);
      toast.success('3 variations ready!');
    } catch (error: any) {
      toast.error('Variation generation failed');
    } finally {
      store.setIsGeneratingEnvironment(false);
    }
  };

  const handleDelete = async (envId: string) => {
    try {
      await axios.delete(`${API_URL}/api/ai/environments/saved/${envId}`, {
        data: { userId: USER_ID },
      });
      toast.success('Environment deleted');
      loadSavedEnvironments();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const selectEnvironment = (env: AiGeneratedEnvironment) => {
    store.setAiGeneratedEnvironment(env);
    store.setTemplate(null as any);
    toast.success(`Selected "${env.name}"`);
  };

  const saveVariation = async (variation: any) => {
    try {
      toast('Saving to library...', { icon: '💾' });
      await axios.post(`${API_URL}/api/ai/environments/generate`, {
        prompt: variation.dallePrompt || variation.description,
        userId: USER_ID,
        artworkWidth: store.artworkDimensions.width,
        artworkHeight: store.artworkDimensions.height,
        unit: store.artworkDimensions.unit,
      });
      toast.success('Saved to your library!');
      loadSavedEnvironments();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const filteredSaved = store.savedEnvironments.filter(e => 
    !searchQuery || 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.mood?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
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
          onClick={() => { setActiveTab('saved'); loadSavedEnvironments(); }}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'saved' 
              ? 'bg-gradient-to-r from-accent-gold to-accent-copper text-gallery-950' 
              : 'text-gallery-400 hover:text-gallery-200'
          }`}
        >
          <Bookmark className="w-4 h-4 inline mr-1.5" />
          Saved ({store.savedEnvironments.length})
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
                value={store.aiEnvironmentPrompt}
                onChange={(e) => store.setAiEnvironmentPrompt(e.target.value)}
                placeholder="Describe your ideal environment... e.g., 'A warm, candlelit wine cellar with stone arches and oak barrels'"
                className="w-full h-28 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gallery-200 placeholder-gallery-600 resize-none focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-all"
              />
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="absolute bottom-3 right-3 text-xs text-gallery-500 hover:text-accent-gold flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Inspiration
                <ChevronDown className={`w-3 h-3 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1">
                    {ENV_PROMPT_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          store.setAiEnvironmentPrompt(s);
                          setShowSuggestions(false);
                        }}
                        className="text-left text-xs px-3 py-2.5 rounded-lg border border-white/5 text-gallery-400 hover:text-gallery-200 hover:bg-white/5 hover:border-white/10 transition-all leading-relaxed"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={store.isGeneratingEnvironment || !store.aiEnvironmentPrompt.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {store.isGeneratingEnvironment ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Globe className="w-4 h-4" /> Generate Environment</>
                )}
              </button>
              <button
                onClick={handleGenerateVariations}
                disabled={store.isGeneratingEnvironment || !store.aiEnvironmentPrompt.trim()}
                className="btn-ghost flex items-center gap-2 disabled:opacity-40"
                title="Generate 3 variations"
              >
                <Sparkles className="w-4 h-4" /> ×3
              </button>
            </div>

            {/* Generated result */}
            {store.aiGeneratedEnvironment && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel overflow-hidden"
              >
                <img
                  src={`${API_URL}${store.aiGeneratedEnvironment.imageUrl}`}
                  alt={store.aiGeneratedEnvironment.name}
                  className="w-full aspect-[16/10] object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gallery-100">
                      {store.aiGeneratedEnvironment.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold">
                      {store.aiGeneratedEnvironment.category}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gallery-500">
                    {store.aiGeneratedEnvironment.wallColor && (
                      <span>🎨 {store.aiGeneratedEnvironment.wallColor}</span>
                    )}
                    {store.aiGeneratedEnvironment.lighting && (
                      <span>💡 {store.aiGeneratedEnvironment.lighting}</span>
                    )}
                    {store.aiGeneratedEnvironment.mood && (
                      <span>✨ {store.aiGeneratedEnvironment.mood}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-400 pt-1">
                    <Check className="w-3 h-3" />
                    Auto-saved to your library
                  </div>
                </div>
              </motion.div>
            )}

            {/* Variations */}
            {store.aiEnvironmentVariations.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <p className="text-xs text-gallery-500 uppercase tracking-wider">Variations — click to preview, save to keep</p>
                <div className="grid grid-cols-3 gap-2">
                  {store.aiEnvironmentVariations.map((v, i) => (
                    <div key={i} className="glass-panel overflow-hidden group cursor-pointer hover:border-accent-gold/30 transition-all">
                      <div className="relative">
                        <img
                          src={v.imageUrl}
                          alt={v.name}
                          className="w-full aspect-[4/3] object-cover"
                          onClick={() => store.setAiGeneratedEnvironment(v as any)}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); saveVariation(v); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-gold/80"
                          title="Save to library"
                        >
                          <Bookmark className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] text-gallery-300 truncate">{v.name}</p>
                        <p className="text-[9px] text-gallery-600 truncate">{v.description}</p>
                      </div>
                    </div>
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
                placeholder="Search environments..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gallery-200 placeholder-gallery-600 focus:outline-none focus:border-accent-gold/50 transition-all"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                    categoryFilter === cat.id 
                      ? 'border-accent-gold/50 bg-accent-gold/10 text-accent-gold' 
                      : 'border-white/10 text-gallery-500 hover:border-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Saved grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredSaved.map((env) => (
                <motion.div
                  key={env.id}
                  layout
                  className={`relative glass-panel overflow-hidden cursor-pointer group transition-all ${
                    store.aiGeneratedEnvironment?.id === env.id 
                      ? 'border-accent-gold ring-1 ring-accent-gold/30' 
                      : 'hover:border-white/20'
                  }`}
                  onClick={() => selectEnvironment(env)}
                >
                  <div className="relative">
                    <img
                      src={`${API_URL}${env.thumbnailUrl || env.imageUrl}`}
                      alt={env.name}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    {store.aiGeneratedEnvironment?.id === env.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-gold flex items-center justify-center">
                        <Check className="w-3 h-3 text-gallery-950" />
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(env.id); }}
                      className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gallery-200 truncate">{env.name}</p>
                    <p className="text-[10px] text-gallery-500">
                      {env.category} · {env.mood || env.lighting}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredSaved.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gallery-500">No saved environments</p>
                <p className="text-xs text-gallery-600 mt-1">Generate your first custom environment above</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}