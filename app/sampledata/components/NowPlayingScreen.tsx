import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MoreVertical, Shuffle, SkipBack, SkipForward, Pause, Play, Repeat, Upload } from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEffect, useState } from 'react';

interface NowPlayingScreenProps {
  onNavigate: (screen: string) => void;
  onUpload: () => void;
}

export const NowPlayingScreen = ({ onNavigate, onUpload }: NowPlayingScreenProps) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    pause,
    resume,
    next,
    previous,
    seek,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
  } = useMusicContext();

  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const bars = Array.from({ length: 50 }, () => Math.random());
    setWaveformBars(bars);
  }, [currentSong]);

  if (!currentSong) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">No song playing</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleWaveformSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  // Handle swipe down gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startY;
    
    // If swiped down more than 100px, close the screen
    if (diff > 100) {
      onNavigate('home');
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Blurred Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 blurred-bg">
          <ImageWithFallback
            src={currentSong.artwork}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 flex items-center justify-between flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full glass-button flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-[2px]"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="w-[2px] h-3 bg-red-500 rounded-full" />
              ))}
            </motion.div>
            <p className="text-xs sm:text-sm">Your Playlist</p>
          </div>
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full glass-button flex items-center justify-center"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMenu(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-12 glass-effect rounded-2xl overflow-hidden shadow-xl z-50 min-w-[200px]"
                  >
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowMenu(false);
                        onUpload();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-sm sm:text-base">Upload Music</span>
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Album Art - Smaller Square */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-8 sm:px-12 md:px-16 lg:px-24 py-4 sm:py-6 flex-shrink-0"
        >
          <div className="relative max-w-[280px] sm:max-w-[320px] md:max-w-[360px] mx-auto">
            {/* Glow Effect */}
            <motion.div
              animate={{
                opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.3,
                scale: isPlaying ? [1, 1.1, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 blur-[80px] rounded-full"
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl"
            >
              <ImageWithFallback
                src={currentSong.artwork}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Song Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-6 sm:px-8 text-center mb-4 sm:mb-6 flex-shrink-0"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl mb-1">{currentSong.title}</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300">{currentSong.artist}</p>
        </motion.div>

        {/* Waveform with Time */}
        <div className="px-6 sm:px-8 mb-4 sm:mb-6 flex-shrink-0">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 }}
            className="cursor-pointer"
            onClick={handleWaveformSeek}
          >
            <div className="flex items-center justify-center gap-[2px] h-12 sm:h-16 mb-2">
              {waveformBars.map((height, index) => {
                const barProgress = (index / waveformBars.length) * 100;
                const isPassed = barProgress < progress;
                return (
                  <motion.div
                    key={index}
                    animate={{
                      height: isPlaying
                        ? [`${height * 40}px`, `${height * 60}px`, `${height * 40}px`]
                        : `${height * 40}px`,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: index * 0.01,
                    }}
                    className={`w-[2px] rounded-full transition-colors duration-300 ${
                      isPassed ? 'bg-white' : 'bg-gray-600'
                    }`}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-6 sm:px-8 flex items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 flex-shrink-0"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleShuffle}
            className={`p-2 sm:p-3 glass-button rounded-full transition-colors ${
              isShuffle ? 'text-blue-400' : 'text-white'
            }`}
          >
            <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={previous}
            className="p-2 sm:p-3 glass-button rounded-full"
          >
            <SkipBack className="w-6 h-6 sm:w-7 sm:h-7" fill="white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (isPlaying ? pause() : resume())}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full glass-button flex items-center justify-center shadow-2xl shadow-blue-500/30"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8" fill="white" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" fill="white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={next}
            className="p-2 sm:p-3 glass-button rounded-full"
          >
            <SkipForward className="w-6 h-6 sm:w-7 sm:h-7" fill="white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRepeat}
            className={`p-2 sm:p-3 glass-button rounded-full transition-colors ${
              isRepeat ? 'text-blue-400' : 'text-white'
            }`}
          >
            <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};
