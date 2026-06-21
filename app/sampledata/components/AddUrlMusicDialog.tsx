import { motion, AnimatePresence } from 'motion/react';
import { X, Link2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Song } from '../types/music';

interface AddUrlMusicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: Song) => void;
}

export const AddUrlMusicDialog = ({ isOpen, onClose, onAddSong }: AddUrlMusicDialogProps) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    
    try {
      // Create a new song from URL
      const song: Song = {
        id: `url-${Date.now()}-${Math.random()}`,
        title: title.trim() || 'Untitled',
        artist: artist.trim() || 'Unknown Artist',
        artwork: 'https://images.unsplash.com/photo-1682764690957-d0cad2fee4cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5lb24lMjBtdXNpY3xlbnwxfHx8fDE3NjI3MzMzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        duration: 180,
        audio: url,
      };

      onAddSong(song);
      handleClose();
    } catch (error) {
      console.error('Error adding song from URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setTitle('');
    setArtist('');
    setIsLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 w-full sm:w-[90%] max-w-md mx-auto glass-effect backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>
                <h2 className="text-lg sm:text-xl md:text-[22px] text-white">Add from URL</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Audio URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/song.mp3"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Song Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Favorite Song"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Artist Name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  Paste a direct link to an audio file (MP3, WAV, etc.)
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="flex-1 py-3 bg-white/5 text-white rounded-full hover:bg-white/10 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: url.trim() ? 1.02 : 1 }}
                whileTap={{ scale: url.trim() ? 0.98 : 1 }}
                onClick={handleAdd}
                disabled={!url.trim() || isLoading}
                className={`flex-1 py-3 rounded-full transition-colors flex items-center justify-center gap-2 ${
                  url.trim() && !isLoading
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Song</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
