import { motion } from 'motion/react';
import { ArrowLeft, Play, Heart, Shuffle } from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';
import { Playlist } from '../types/music';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AlbumDetailScreenProps {
  playlist: Playlist;
  onNavigate: (screen: string) => void;
}

export const AlbumDetailScreen = ({ playlist: playlistData, onNavigate }: AlbumDetailScreenProps) => {
  const { getPlaylistSongs, play, currentSong, toggleLike, isSongLiked } = useMusicContext();
  const songs = getPlaylistSongs(playlistData.id);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      play(songs[0]);
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      play(songs[randomIndex]);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white pb-32"
    >
      {/* Header with Back Button */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('home')}
          className="w-10 h-10 rounded-full glass-button flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Playlist Header with Cover and Title */}
      <div className="px-4 sm:px-6 md:px-8 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 sm:gap-6 mb-6"
        >
          {/* Small Cover Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
            {playlistData.id === 'liked-songs' ? (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 fill-white text-white" />
              </div>
            ) : (
              <ImageWithFallback
                src={playlistData.artwork}
                alt={playlistData.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Playlist Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl mb-1 truncate">{playlistData.title}</h1>
            <p className="text-sm sm:text-base text-gray-400">{songs.length} Songs</p>
          </div>
        </motion.div>

        {/* Play All and Shuffle Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 sm:gap-4"
        >
          {/* Play All Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 glass-button rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="white" />
            <span className="text-sm sm:text-base">Play All</span>
          </motion.button>

          {/* Shuffle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShuffle}
            disabled={songs.length === 0}
            className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 glass-button rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base hidden sm:inline">Shuffle</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Songs List */}
      <div className="px-4 sm:px-6 md:px-8">
        {songs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No songs in this playlist</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {songs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`glass-effect rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-white/10 transition-colors ${
                  currentSong?.id === song.id ? 'bg-white/10' : ''
                }`}
              >
                <motion.div
                  onClick={() => play(song)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0"
                >
                  <ImageWithFallback
                    src={song.artwork}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <div className="flex-1 min-w-0" onClick={() => play(song)}>
                  <p className="truncate text-sm sm:text-base">{song.title}</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    {song.isExplicit && (
                      <span className="px-1 text-[9px] sm:text-[10px] bg-gray-600 rounded">E</span>
                    )}
                    {song.isLyrics && (
                      <span className="text-[9px] sm:text-[10px]">Lyrics</span>
                    )}
                    <span className="truncate">{song.artist}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-gray-400">{formatDuration(song.duration)}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song.id);
                    }}
                    className="p-1.5 sm:p-2"
                  >
                    <Heart
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                        isSongLiked(song.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      }`}
                    />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
