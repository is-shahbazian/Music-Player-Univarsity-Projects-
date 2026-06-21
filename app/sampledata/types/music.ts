export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  audio?: string;
  isLyrics?: boolean;
  isExplicit?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  songCount: number;
  artwork: string;
  songIds: string[];
}
