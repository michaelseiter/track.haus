export interface TopItem {
  id: number;
  name: string;
  play_count: number;
  last_played: string;
}

export interface TimeStats {
  hour?: number;
  day?: number;
  month?: number;
  play_count: number;
}

export interface RatingStats {
  rating: string;
  play_count: number;
}

export interface Stats {
  overall: {
    total_plays: number;
    unique_tracks: number;
    unique_artists: number;
    total_time_seconds: number;
    first_play: string;
    last_play: string;
  };
  top_tracks: TopItem[];
  top_artists: TopItem[];
  top_albums: TopItem[];
  top_stations: TopItem[];
  plays_by_hour: TimeStats[];
  plays_by_day: TimeStats[];
  plays_by_month: TimeStats[];
  rating_distribution: RatingStats[];
}
