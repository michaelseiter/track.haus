export interface Artist {
  id: number;
  name: string;
  mbid: string | null;
  validated: string | null;
}

export interface Album {
  id: number;
  title: string;
  artist_id: number;
  mbid: string | null;
  cover_art_url: string | null;
  validated: string | null;
}

export interface Track {
  id: number;
  title: string;
  artist: Artist;
  album: Album;
  mbid: string | null;
  created_at: string;
  updated_at: string;
  validated: string | null;
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
