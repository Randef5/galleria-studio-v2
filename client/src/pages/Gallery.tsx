import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, LayoutGrid, List } from 'lucide-react';

interface SavedMockup {
  id: string;
  mockupUrl: string;
  artworkUrl: string;
  width: number;
  height: number;
  unit: string;
  frameStyle: string;
  environmentDesc: string;
  createdAt: string;
}

export default function Gallery() {
  const [mockups, setMockups] = useState<SavedMockup[]>([]);
  const [viewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('galleria-mockups') || '[]');
    setMockups(saved);
  }, []);

  const handleDelete = (id: string) => {
    const updated = mockups.filter(m => m.id !== id);
    setMockups(updated);
    localStorage.setItem('galleria-mockups', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-gallery-100">My Gallery</h1>
            <p className="text-gallery-500 mt-1">{mockups.length} mockup{mockups.length !== 1 ? 's' : ''} created</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white/10 text-accent-gold' : 'text-gallery-500 hover:text-gallery-300'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white/10 text-accent-gold' : 'text-gallery-500 hover:text-gallery-300'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mockups.length === 0 ? (
          <div className="glass-panel p-16 text-center">
            <p className="text-gallery-500 text-lg">No mockups yet</p>
            <p className="text-gallery-600 text-sm mt-2">Create your first mockup in the Studio</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'
          }>
            {mockups.map((mockup, i) => (
              <motion.div
                key={mockup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel overflow-hidden group cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={mockup.mockupUrl}
                    alt="Mockup"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <a
                        href={mockup.mockupUrl}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(mockup.id);
                        }}
                        className="w-9 h-9 rounded-full bg-red-500/50 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/70 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gallery-200">
                    {mockup.width}×{mockup.height} {mockup.unit} · {mockup.frameStyle.replace(/-/g, ' ')}
                  </p>
                  <p className="text-xs text-gallery-500 mt-1">
                    {new Date(mockup.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}