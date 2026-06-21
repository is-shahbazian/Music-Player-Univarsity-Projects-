import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { MusicProvider } from './context/MusicContext';
import { HomeScreen } from './components/HomeScreen';
import { SearchScreen } from './components/SearchScreen';
import { NowPlayingScreen } from './components/NowPlayingScreen';
import { AlbumDetailScreen } from './components/AlbumDetailScreen';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { UploadMusicDialog } from './components/UploadMusicDialog';
import { CreatePlaylistDialog } from './components/CreatePlaylistDialog';
import { Playlist } from './types/music';

type Screen = 'home' | 'search' | 'nowplaying' | 'album';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const userAvatar = 'https://images.unsplash.com/photo-1652781281157-cb04fbc9585e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwcG9ydHJhaXQlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjI3MzMzNzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

  const handleOpenPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentScreen('album');
  };

  return (
    <MusicProvider>
      <div className="relative min-h-screen bg-black overflow-hidden">
        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <HomeScreen
              key="home"
              onNavigate={setCurrentScreen}
              onOpenPlaylist={handleOpenPlaylist}
              userAvatar={userAvatar}
              onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
            />
          )}
          {currentScreen === 'search' && (
            <SearchScreen
              key="search"
              onNavigate={setCurrentScreen}
            />
          )}
          {currentScreen === 'nowplaying' && (
            <NowPlayingScreen
              key="nowplaying"
              onNavigate={setCurrentScreen}
              onUpload={() => setIsUploadDialogOpen(true)}
            />
          )}
          {currentScreen === 'album' && selectedPlaylist && (
            <AlbumDetailScreen
              key="album"
              playlist={selectedPlaylist}
              onNavigate={setCurrentScreen}
            />
          )}
        </AnimatePresence>

        {/* Bottom Player Bar */}
        <BottomPlayerBar onNavigate={setCurrentScreen} currentScreen={currentScreen} />

        {/* Upload Dialog */}
        <UploadMusicDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
        />

        {/* Create Playlist Dialog */}
        <CreatePlaylistDialog
          isOpen={isCreatePlaylistOpen}
          onClose={() => setIsCreatePlaylistOpen(false)}
        />
      </div>
    </MusicProvider>
  );
}