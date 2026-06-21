import { motion } from 'motion/react';
import { Search, Plus, Link2, Heart, Shuffle as ShuffleIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AddUrlMusicDialog } from './AddUrlMusicDialog';
import { Playlist } from '../types/music';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  onOpenPlaylist: (playlist: Playlist) => void;
  userAvatar: string;
  onCreatePlaylist: () => void;
}

export const HomeScreen = ({ onNavigate, onOpenPlaylist, userAvatar, onCreatePlaylist }: HomeScreenProps) => {
  const { 
    playlist, 
    uploadedSongs, 
    play, 
    shuffle: shufflePlay, 
    currentSong, 
    userPlaylists, 
    addUploadedSong,
    likedSongs,
    toggleLike,
    isSongLiked,
  } = useMusicContext();
  const allSongs = [...playlist, ...uploadedSongs];
  const [isAddUrlDialogOpen, setIsAddUrlDialogOpen] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning');

  // Update greeting based on time
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };
    
    updateGreeting();
    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Create a special "Liked Songs" playlist
  const likedSongsPlaylist: Playlist = {
    id: 'liked-songs',
    title: 'Liked Songs',
    songCount: likedSongs.length,
    artwork: '',
    songIds: likedSongs,
  };

  const allPlaylists = likedSongs.length > 0 ? [likedSongsPlaylist, ...userPlaylists] : userPlaylists;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white pb-32"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl md:text-4xl">{greeting}</h1>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden glass-effect"
        >
          <ImageWithFallback src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
        </motion.div>
      </div>

      {/* Playlists Section */}
      <div className="px-4 sm:px-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl">Playlists</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Add Playlist Button - appears first when no playlists */}
          {allPlaylists.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreatePlaylist}
              className="aspect-square rounded-xl sm:rounded-2xl glass-effect cursor-pointer flex flex-col items-center justify-center gap-2 sm:gap-3"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-xs sm:text-sm">Create Playlist</p>
            </motion.div>
          )}
          
          {/* Existing Playlists */}
          {allPlaylists.map((playlistItem, index) => (
            <motion.div
              key={playlistItem.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenPlaylist(playlistItem)}
              className="cursor-pointer"
            >
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-2 aspect-square glass-effect">
                {playlistItem.id === 'liked-songs' ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
                    <Heart className="w-12 h-12 sm:w-16 sm:h-16 fill-white text-white" />
                  </div>
                ) : (
                  <ImageWithFallback
                    src={playlistItem.artwork}
                    alt={playlistItem.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs sm:text-sm truncate">{playlistItem.title}</p>
                  <p className="text-[10px] sm:text-xs text-gray-300">{playlistItem.songCount} SONGS</p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Add Playlist Button - appears next to existing playlists */}
          {allPlaylists.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreatePlaylist}
              className="aspect-square rounded-xl sm:rounded-2xl glass-effect cursor-pointer flex flex-col items-center justify-center gap-2 sm:gap-3"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-xs sm:text-sm">Add Playlist</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Music's Section */}
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="white" className="sm:w-5 sm:h-5">
                <rect x="2" y="2" width="7" height="7" rx="1" />
                <rect x="11" y="2" width="7" height="7" rx="1" />
                <rect x="2" y="11" width="7" height="7" rx="1" />
                <rect x="11" y="11" width="7" height="7" rx="1" />
              </svg>
              <h2 className="text-xl sm:text-2xl md:text-3xl">Music's</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">{allSongs.length} Songs</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('search')}
              className="px-3 py-2 sm:px-4 sm:py-2.5 glass-button rounded-full flex items-center gap-2"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            
            {/* Shuffle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shufflePlay}
              className="px-3 py-2 sm:px-4 sm:py-2.5 glass-button rounded-full flex items-center gap-2"
            >
              <ShuffleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm hidden sm:inline">Shuffle</span>
            </motion.button>
            
            {/* Add Music via Link Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddUrlDialogOpen(true)}
              className="px-3 py-2 sm:px-4 sm:py-2.5 glass-button rounded-full flex items-center gap-2"
              title="Add from URL"
            >
              <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>

        {/* Song List or Empty State */}
        {allSongs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full py-12 sm:py-16 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full glass-effect flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor" className="sm:w-10 sm:h-10 text-gray-500">
                <rect x="2" y="2" width="7" height="7" rx="1" />
                <rect x="11" y="2" width="7" height="7" rx="1" />
                <rect x="2" y="11" width="7" height="7" rx="1" />
                <rect x="11" y="11" width="7" height="7" rx="1" />
              </svg>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-3">No songs yet</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">Upload music or add from URL to get started</p>
          </motion.div>
        ) : (
          <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
            {allSongs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 sm:gap-4 cursor-pointer p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-colors ${
                  currentSong?.id === song.id ? 'glass-effect' : 'hover:bg-white/5'
                }`}
              >
                <div 
                  onClick={() => play(song)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0"
                >
                  <ImageWithFallback
                    src={song.artwork}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </div>
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
                  <div className="text-xs sm:text-sm text-gray-400">
                    {currentSong?.id === song.id ? (
                      <div className="flex items-center gap-[2px]">
                        {[1, 2, 3, 4].map(i => (
                          <motion.div
                            key={i}
                            animate={{ height: ['8px', '16px', '8px'] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8,
                              delay: i * 0.1,
                            }}
                            className="w-[2px] bg-white rounded-full"
                          />
                        ))}
                      </div>
                    ) : (
                      formatDuration(song.duration)
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add URL Dialog */}
      <AddUrlMusicDialog
        isOpen={isAddUrlDialogOpen}
        onClose={() => setIsAddUrlDialogOpen(false)}
        onAddSong={addUploadedSong}
      />
    </motion.div>
  );
};
