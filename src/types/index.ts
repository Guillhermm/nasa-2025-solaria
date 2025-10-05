export interface ImageMeta {
  id: string;
  name: string;
  mission: string;
  timestamp: string;
  width: number;
  height: number;
  tileSize: number;
  minLevel: number;
  maxLevel: number;
}

// Types
export interface ImageResolution {
  level: number;
  name: string;
  url: string;
  width: number;
}

export interface Flag {
  id: string;
  x: number;
  y: number;
  name: string;
}

export interface Position {
  x: number;
  y: number;
}
