export interface Track {
  title: string;
  artist: string;
  album: string;
  station: string;
  played_at: string;
}

export interface TrackStats {
  topArtists: Array<{
    artist: string;
    count: number;
  }>;
  topSongs: Array<{
    title: string;
    artist: string;
    count: number;
  }>;
}
