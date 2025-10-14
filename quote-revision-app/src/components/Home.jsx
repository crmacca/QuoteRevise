import React, { useState, useEffect } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { getTexts, createText, deleteText } from '../utils/storage';

const Home = ({ onSelectText, onViewAnalytics }) => {
  const [texts, setTexts] = useState([]);
  const [newTextName, setNewTextName] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = () => {
    const loadedTexts = getTexts();
    setTexts(loadedTexts);
  };

  const handleCreateText = () => {
    if (newTextName.trim()) {
      createText(newTextName.trim());
      setNewTextName('');
      setShowInput(false);
      loadTexts();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-12 w-screen flex justify-center">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-5xl font-bold text-zinc-800 mb-3">My Texts</h1>
            <p className="text-lg text-zinc-500">Select a text to begin practicing</p>
          </div>
          <p className='text-gray-400'>
            © {new Date().getUTCFullYear()} Christian McNamara
          </p>
          <button
            onClick={() => onViewAnalytics()}
            className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-stone-200 rounded-md hover:bg-stone-50 transition-all shadow-sm"
          >
            <BarChart3 className="w-6 h-6 text-orange-600" />
            <span className="font-semibold text-zinc-700">Analytics</span>
          </button>
        </div>

        {/* Texts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {texts.map((text) => (
            <button
              key={text.id}
              onClick={() => onSelectText(text.id)}
              className="cardboard-texture rounded-lg p-10 shadow-md hover:shadow-xl transition-all duration-300 text-left group relative overflow-hidden"
              style={{ aspectRatio: '1 / 1.414' }}
            >
              {/* Subtle paper lines */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="h-px bg-stone-400"
                    style={{ marginTop: '2rem' }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-zinc-800 mb-4 group-hover:text-orange-600 transition-colors">
                  {text.name}
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="font-medium">{text.chapters.length} {text.chapters.length === 1 ? 'chapter' : 'chapters'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                    <span>
                      {text.chapters.reduce((acc, ch) => acc + ch.quotes.length, 0)} quotes
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Add New Text Card */}
          {showInput ? (
            <div
              className="cardboard-texture rounded-lg p-10 shadow-md flex flex-col justify-center"
              style={{ aspectRatio: '1 / 1.414' }}
            >
              <input
                type="text"
                value={newTextName}
                onChange={(e) => setNewTextName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateText();
                  if (e.key === 'Escape') {
                    setShowInput(false);
                    setNewTextName('');
                  }
                }}
                placeholder="Text name..."
                className="w-full px-5 py-4 rounded-md border-2 border-orange-300 focus:border-orange-500 bg-white/80 backdrop-blur mb-5 text-lg"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateText}
                  className="flex-1 px-5 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold border border-orange-600"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowInput(false);
                    setNewTextName('');
                  }}
                  className="flex-1 px-5 py-3 bg-stone-200 text-zinc-700 rounded-md hover:bg-stone-300 transition-colors font-semibold border border-stone-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="border-3 border-dashed border-stone-300 rounded-lg hover:border-orange-400 hover:bg-orange-50/30 transition-all duration-300 flex flex-col items-center justify-center gap-5 group"
              style={{ aspectRatio: '1 / 1.414' }}
            >
              <div className="w-20 h-20 rounded-md bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors border border-orange-300">
                <Plus className="w-10 h-10 text-orange-600" />
              </div>
              <span className="font-bold text-zinc-600 group-hover:text-orange-600 transition-colors text-lg">
                New Text
              </span>
            </button>
          )}
        </div>

        {texts.length === 0 && !showInput && (
          <div className="text-center py-32">
            <p className="text-zinc-400 text-xl mb-8">No texts yet. Create your first one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;