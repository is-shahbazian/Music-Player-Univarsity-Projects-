import { motion, AnimatePresence } from 'motion/react';
import { X, ImageIcon, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { Playlist, Song } from '../types/music';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreatePlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistDialog = ({ isOpen, onClose }: CreatePlaylistDialogProps) => {
  const [step, setStep] = useState<'name' | 'cover' | 'songs'>('name');
  const [playlistName, setPlaylistName] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createPlaylist, playlist, uploadedSongs } = useMusicContext();

  const allSongs = [...playlist, ...uploadedSongs];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSong = (songId: string) => {
    setSelectedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handleCreate = () => {
    if (!playlistName.trim()) return;

    const newPlaylist: Playlist = {
      id: `user-${Date.now()}`,
      title: playlistName,
      artwork: coverImage || 'https://images.unsplash.com/photo-1682764690957-d0cad2fee4cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5lb24lMjBtdXNpY3xlbnwxfHx8fDE3NjI3MzMzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      songIds: selectedSongs,
      songCount: selectedSongs.length,
    };

    createPlaylist(newPlaylist);
    handleClose();
  };

  const handleClose = () => {
    setStep('name');
    setPlaylistName('');
    setCoverImage('');
    setSelectedSongs([]);
    onClose();
  };

  const canProceed = () => {
    if (step === 'name') return playlistName.trim().length > 0;
    if (step === 'cover') return true;
    return true;
  };

  const handleNext = () => {
    if (step === 'name') setStep('cover');
    else if (step === 'cover') setStep('songs');
    else handleCreate();
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
            className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 w-full sm:w-[90%] max-w-md mx-auto glass-effect backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden z-50 max-h-[85vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg sm:text-xl md:text-[22px] text-white">
                {step === 'name' && 'Create Playlist'}
                {step === 'cover' && 'Choose Cover'}
                {step === 'songs' && 'Add Songs'}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Progress Indicators */}
            <div className="px-6 pt-4 pb-2 flex gap-2 flex-shrink-0">
              {['name', 'cover', 'songs'].map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: 1,
                    backgroundColor:
                      step === s
                        ? 'rgb(37, 99, 235)'
                        : ['name', 'cover', 'songs'].indexOf(step) > i
                        ? 'rgb(34, 197, 94)'
                        : 'rgba(255, 255, 255, 0.1)',
                  }}
                  className="h-1 flex-1 rounded-full"
                  style={{ originX: 0 }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 'name' && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="px-6 py-6"
                  >
                    <label className="block text-sm text-gray-400 mb-2">
                      Playlist Name
                    </label>
                    <input
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="My Awesome Playlist"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                      autoFocus
                    />
                  </motion.div>
                )}

                {step === 'cover' && (
                  <motion.div
                    key="cover"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="px-6 py-6"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    {coverImage ? (
                      <div className="space-y-4">
                        <div className="aspect-square rounded-2xl overflow-hidden">
                          <ImageWithFallback
                            src={coverImage}
                            alt="Playlist cover"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                        >
                          Change Image
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500 bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-colors"
                      >
                        <ImageIcon className="w-16 h-16 text-gray-500 mb-4" />
                        <p className="text-white mb-1">Tap to upload cover</p>
                        <p className="text-sm text-gray-400">or skip to use default</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {step === 'songs' && (
                  <motion.div
                    key="songs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="px-6 py-6"
                  >
                    <p className="text-sm text-gray-400 mb-4">
                      {selectedSongs.length} song{selectedSongs.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="space-y-2">
                      {allSongs.map((song, index) => {
                        const isSelected = selectedSongs.includes(song.id);
                        return (
                          <motion.div
                            key={song.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleSong(song.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={song.artwork}
                                alt={song.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white truncate text-sm">{song.title}</p>
                              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                            </div>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: isSelected ? 1 : 0 }}
                              className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex gap-3 flex-shrink-0">
              {step !== 'name' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (step === 'cover') setStep('name');
                    else if (step === 'songs') setStep('cover');
                  }}
                  className="px-6 py-3 bg-white/5 text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  Back
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: canProceed() ? 1.02 : 1 }}
                whileTap={{ scale: canProceed() ? 0.98 : 1 }}
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex-1 py-3 rounded-full transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                {step === 'songs' ? 'Create Playlist' : 'Next'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
