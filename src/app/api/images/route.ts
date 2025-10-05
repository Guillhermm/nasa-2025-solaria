import { ImageMeta } from '../../../types';

export const images: ImageMeta[] = [
  {
    id: 'hubble-mosaic',
    name: 'Andromeda Galaxy',
    mission: 'Hubble',
    timestamp: '2015-10-02',
    width: 20000,
    height: 12000,
    tileSize: 256,
    minLevel: 0,
    maxLevel: 8,
  },
  {
    id: 'hubble-mosaic-high',
    name: 'Andromeda Galaxy (High)',
    mission: 'Hubble',
    timestamp: '2015-10-02',
    width: 96000,
    height: 20000,
    tileSize: 256,
    minLevel: 0,
    maxLevel: 7,
  },
];

export async function GET() {
  return Response.json(images);
}