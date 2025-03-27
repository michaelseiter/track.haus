import { Track } from './track';

export interface Station {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Play {
  id: number;
  track: Track;
  station: Station;
  rating: 'LIKE' | 'DISLIKE' | 'UNRATED';
  played_at: string;
  created_at: string;
}
