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

// Deep Viewer types and interfaces
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

// Spectral Gallery types and interfaces
export type VisualMode = "normal" | "infrared" | "uv";

export interface NasaImage {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
}

export interface SpectralGalleryProps {
  title: string;
  images: NasaImage[];
  initialMode?: VisualMode;
  initialImageId?: string;
}