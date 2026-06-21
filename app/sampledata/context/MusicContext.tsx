import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Song, Playlist } from '../types/music';

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playlist: Song[];
  uploadedSongs: Song[];
  userPlaylists: Playlist[];
  likedSongs: string[];
  play: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  shuffle: () => void;
  seek: (time: number) => void;
  addUploadedSong: (song: Song) => void;
  createPlaylist: (playlist: Playlist) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  getPlaylistSongs: (playlistId: string) => Song[];
  toggleLike: (songId: string) => void;
  isSongLiked: (songId: string) => boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicContext must be used within MusicProvider');
  }
  return context;
};

// Storage keys
const STORAGE_KEYS = {
  UPLOADED_SONGS: 'music_player_uploaded_songs',
  USER_PLAYLISTS: 'music_player_user_playlists',
  LIKED_SONGS: 'music_player_liked_songs',
};

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist] = useState<Song[]>([]);
  const [uploadedSongs, setUploadedSongs] = useState<Song[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUploaded = localStorage.getItem(STORAGE_KEYS.UPLOADED_SONGS);
      const savedPlaylists = localStorage.getItem(STORAGE_KEYS.USER_PLAYLISTS);
      const savedLiked = localStorage.getItem(STORAGE_KEYS.LIKED_SONGS);

      if (savedUploaded) {
        setUploadedSongs(JSON.parse(savedUploaded));
      }
      if (savedPlaylists) {
        setUserPlaylists(JSON.parse(savedPlaylists));
      }
      if (savedLiked) {
        setLikedSongs(JSON.parse(savedLiked));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.UPLOADED_SONGS, JSON.stringify(uploadedSongs));
    } catch (error) {
      console.error('Error saving uploaded songs:', error);
    }
  }, [uploadedSongs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PLAYLISTS, JSON.stringify(userPlaylists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }, [userPlaylists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(likedSongs));
    } catch (error) {
      console.error('Error saving liked songs:', error);
    }
  }, [likedSongs]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        if (isRepeat) {
          audioRef.current?.play();
        } else {
          next();
        }
      });
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const play = async (song: Song) => {
    if (!audioRef.current) return;

    try {
      if (currentSong?.id !== song.id) {
        setCurrentSong(song);
        setCurrentTime(0);
        
        if (song.audio) {
          audioRef.current.src = song.audio;
          await audioRef.current.load();
        } else {
          setDuration(song.duration);
          setIsPlaying(true);
          return;
        }
      }
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = async () => {
    if (audioRef.current && currentSong) {
      try {
        if (currentSong.audio) {
          await audioRef.current.play();
        }
        setIsPlaying(true);
      } catch (error) {
        console.error('Error resuming audio:', error);
        setIsPlaying(true);
      }
    }
  };

  const next = () => {
    if (!currentSong) return;
    const allSongs = [...playlist, ...uploadedSongs];
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % allSongs.length;
    play(allSongs[nextIndex]);
  };

  const previous = () => {
    if (!currentSong) return;
    
    if (currentTime > 3) {
      seek(0);
      return;
    }
    
    const allSongs = [...playlist, ...uploadedSongs];
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? allSongs.length - 1 : currentIndex - 1;
    play(allSongs[prevIndex]);
  };

  const shuffle = () => {
    const allSongs = [...playlist, ...uploadedSongs];
    const randomIndex = Math.floor(Math.random() * allSongs.length);
    play(allSongs[randomIndex]);
  };

  const seek = (time: number) => {
    if (audioRef.current && currentSong?.audio) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } else {
      setCurrentTime(time);
    }
  };

  const addUploadedSong = (song: Song) => {
    setUploadedSongs(prev => [...prev, song]);
  };

  const createPlaylist = (playlist: Playlist) => {
    setUserPlaylists(prev => [...prev, playlist]);
  };

  const addSongToPlaylist = (playlistId: string, songId: string) => {
    setUserPlaylists(prev =>
      prev.map(p =>
        p.id === playlistId
          ? { ...p, songIds: [...p.songIds, songId], songCount: p.songIds.length + 1 }
          : p
      )
    );
  };

  const getPlaylistSongs = (playlistId: string): Song[] => {
    // Handle Liked Songs specially
    if (playlistId === 'liked-songs') {
      const allSongs = [...playlist, ...uploadedSongs];
      return likedSongs
        .map(id => allSongs.find(s => s.id === id))
        .filter((song): song is Song => song !== undefined);
    }
    
    const playlistData = userPlaylists.find(p => p.id === playlistId);
    if (!playlistData) return [];
    
    const allSongs = [...playlist, ...uploadedSongs];
    return playlistData.songIds
      .map(id => allSongs.find(s => s.id === id))
      .filter((song): song is Song => song !== undefined);
  };

  const toggleLike = (songId: string) => {
    setLikedSongs(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  const isSongLiked = (songId: string) => {
    return likedSongs.includes(songId);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        playlist,
        uploadedSongs,
        userPlaylists,
        likedSongs,
        play,
        pause,
        resume,
        next,
        previous,
        shuffle,
        seek,
        addUploadedSong,
        createPlaylist,
        addSongToPlaylist,
        getPlaylistSongs,
        toggleLike,
        isSongLiked,
        isShuffle,
        isRepeat,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};