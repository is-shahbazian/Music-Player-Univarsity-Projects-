import { motion } from 'motion/react';
import { Play, Pause, Heart } from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BottomPlayerBarProps {
  onNavigate: (screen: string) => void;
  currentScreen: string;
}

export const BottomPlayerBar = ({ onNavigate, currentScreen }: BottomPlayerBarProps) => {
  const { currentSong, isPlaying, pause, resume, currentTime, duration, toggleLike, isSongLiked } = useMusicContext();

  // Hide mini player on Now Playing screen
  if (!currentSong || currentScreen === 'nowplaying') return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLiked = isSongLiked(currentSong.id);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onClick={() => onNavigate('nowplaying')}
      className="fixed bottom-0 left-0 right-0 glass-effect backdrop-blur-2xl cursor-pointer z-40 mx-2 sm:mx-4 mb-2 rounded-2xl sm:rounded-3xl overflow-hidden"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
        />
      </div>

      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-lg"
        >
          <ImageWithFallback
            src={currentSong.artwork}
            alt={currentSong.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-sm sm:text-base">{currentSong.title}</p>
          <p className="text-xs sm:text-sm text-gray-400 truncate">{currentSong.artist}</p>
        </div>

        {/* Waveform Animation */}
        <div className="hidden sm:flex items-center gap-[2px] mr-3 sm:mr-4">
          {[1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              animate={{
                height: isPlaying ? ['8px', '20px', '8px'] : '8px',
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.1,
              }}
              className="w-[2px] bg-white rounded-full"
            />
          ))}
        </div>

        {/* Like Button */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(currentSong.id);
          }}
          className="p-2"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            isPlaying ? pause() : resume();
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-button flex items-center justify-center shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" fill="white" />
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" fill="white" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};