import { motion } from 'motion/react';
import { Search, ArrowLeft, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SearchScreenProps {
  onNavigate: (screen: string) => void;
}

const filterTabs = ['Top', 'Songs', 'Playlists'];

// Storage key for search history
const SEARCH_HISTORY_KEY = 'music_player_search_history';

export const SearchScreen = ({ onNavigate }: SearchScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Top');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { playlist, uploadedSongs, play, userPlaylists } = useMusicContext();

  // Load search history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  const allSongs = [...playlist, ...uploadedSongs];
  
  const filteredSongs = searchQuery.trim()
    ? allSongs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredPlaylists = searchQuery.trim()
    ? userPlaylists.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
  };

  const getFilteredResults = () => {
    if (activeFilter === 'Songs') {
      return { songs: filteredSongs, playlists: [] };
    } else if (activeFilter === 'Playlists') {
      return { songs: [], playlists: filteredPlaylists };
    } else {
      // Top - show both
      return { songs: filteredSongs, playlists: filteredPlaylists };
    }
  };

  const { songs, playlists } = getFilteredResults();

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="min-h-screen bg-black text-white pb-32"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full glass-button flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-[28px] sm:text-[34px]">Search</h1>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="Search"
            className="w-full bg-white/10 backdrop-blur-lg rounded-2xl py-4 pl-12 pr-4 text-[17px] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </motion.div>
      </div>

      {/* Show search history when not searching */}
      {!hasSearched && searchHistory.length > 0 && (
        <div className="px-4 sm:px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl">Search History</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearHistory}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </motion.button>
          </div>
          <div className="space-y-2">
            {searchHistory.map((query, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleHistoryClick(query)}
                className="flex items-center justify-between p-3 rounded-xl glass-effect cursor-pointer hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-gray-500" />
                  <span className="text-sm sm:text-base">{query}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs - Only show when searching */}
      {hasSearched && searchQuery.trim() && (
        <div className="px-4 sm:px-6 mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filterTabs.map((tab, index) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeFilter === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && searchQuery.trim() && (
        <div className="px-4 sm:px-6">
          {songs.length === 0 && playlists.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No results found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Playlists Results */}
              {playlists.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg mb-3">Playlists</h3>
                  <div className="space-y-3">
                    {playlists.map((playlist, index) => (
                      <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-4 cursor-pointer p-2 rounded-xl hover:bg-white/5"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={playlist.artwork}
                            alt={playlist.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[17px]">{playlist.title}</p>
                          <p className="text-sm text-gray-400">{playlist.songCount} songs</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Songs Results */}
              {songs.length > 0 && (
                <div>
                  {playlists.length > 0 && <h3 className="text-base sm:text-lg mb-3">Songs</h3>}
                  <div className="space-y-3">
                    {songs.map((song, index) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          play(song);
                          onNavigate('nowplaying');
                        }}
                        className="flex items-center gap-4 cursor-pointer p-2 rounded-xl hover:bg-white/5"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={song.artwork}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[17px]">{song.title}</p>
                          <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                        </div>
                        <span className="text-sm text-gray-400">{formatDuration(song.duration)}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
