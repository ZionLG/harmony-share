export type Track = {
  spotifyLink: string;
  id: string;
  name: string;
  artists: Artist[];
  duration_ms: number;
  explicit: boolean;
  previewUrl: string;
};

export type Artist = {
  spotifyLink: string;
  id: string;
  name: string;
};
