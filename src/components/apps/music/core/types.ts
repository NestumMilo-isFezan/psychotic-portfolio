export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  raw?: Record<string, unknown>;
}

export interface HomeFeedResponse {
  tracks?: Record<string, unknown>[];
}
