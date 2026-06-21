import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Music, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { Song } from '../types/music';

interface UploadMusicDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadMusicDialog = ({ isOpen, onClose }: UploadMusicDialogProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addUploadedSong } = useMusicContext();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const audioUrl = e.target?.result as string;
          
          // Create audio element to get duration
          const audio = new Audio();
          audio.src = audioUrl;
          audio.addEventListener('loadedmetadata', () => {
            const song: Song = {
              id: `upload-${Date.now()}-${Math.random()}`,
              title: file.name.replace(/\.[^/.]+$/, ''),
              artist: 'Uploaded',
              artwork: 'https://images.unsplash.com/photo-1682764690957-d0cad2fee4cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5lb24lMjBtdXNpY3xlbnwxfHx8fDE3NjI3MzMzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              duration: audio.duration || 180,
              audio: audioUrl,
            };
            addUploadedSong(song);
            setUploadedFiles(prev => [...prev, file.name]);
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
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
            onClick={onClose}
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
              <h2 className="text-lg sm:text-xl md:text-[22px] text-white">Upload Music</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              {/* Upload Area */}
              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
              >
                <motion.div
                  animate={{
                    y: isDragging ? [0, -10, 0] : 0,
                  }}
                  transition={{ repeat: isDragging ? Infinity : 0, duration: 1 }}
                  className="mb-4"
                >
                  <Upload className="w-12 h-12 mx-auto text-blue-500" />
                </motion.div>
                <p className="text-white mb-2">
                  {isDragging ? 'Drop your files here' : 'Tap to select music files'}
                </p>
                <p className="text-sm text-gray-400">
                  or drag and drop audio files
                </p>
              </motion.div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 space-y-2"
                >
                  <p className="text-sm text-gray-400 mb-3">Uploaded Files:</p>
                  {uploadedFiles.map((filename, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Music className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="flex-1 text-sm text-white truncate">{filename}</p>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-400">
                  <strong>Note:</strong> Uploaded songs will be available in your library and can be played immediately.
                  Supported formats: MP3, WAV, M4A, OGG.
                </p>
              </div>

              {/* Done Button */}
              {uploadedFiles.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
                >
                  Done
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
