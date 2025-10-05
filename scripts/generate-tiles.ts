import fs from 'fs/promises';
import path from 'path';
import Vips from 'wasm-vips';

interface GenerateTilesOptions {
  inputImagePath: string;
  outputTilesDir: string;
  levels: number;
  tileSize: number;
}

async function generateTiles(opts: GenerateTilesOptions): Promise<void> {
  const { inputImagePath, outputTilesDir, levels, tileSize } = opts;

  console.log(`Starting tile generation: input=${inputImagePath}, output=${outputTilesDir}`);
  const vips = await Vips();
  const image = await vips.Image.newFromFile(inputImagePath);

  const origWidth = image.width;
  const origHeight = image.height;

  for (let z = 0; z <= levels; z++) {
    const scale = Math.pow(2, levels - z);
    const w = Math.ceil(origWidth / scale);
    const h = Math.ceil(origHeight / scale);
    console.log(`Level ${z}: scale=${scale.toFixed(2)}, target size=${w}×${h}`);

    const resized = image.resize(1 / scale);

    const numXTiles = Math.ceil(w / tileSize);
    const numYTiles = Math.ceil(h / tileSize);

    for (let x = 0; x < numXTiles; x++) {
      for (let y = 0; y < numYTiles; y++) {
        const left = x * tileSize;
        const top = y * tileSize;

        // Adjust width and height for tiles at the edges
        const width = Math.min(tileSize, resized.width - left);
        const height = Math.min(tileSize, resized.height - top);

        if (width <= 0 || height <= 0) {
          console.warn(`Skipping invalid tile at z=${z}, x=${x}, y=${y}`);
          continue;
        }

        const tile = resized.extractArea(left, top, width, height);

        const tileDir = path.join(outputTilesDir, String(z), String(x));
        await fs.mkdir(tileDir, { recursive: true });

        const tilePath = path.join(tileDir, `${y}.jpg`);
        const buffer = tile.writeToBuffer('.jpg');
        await fs.writeFile(tilePath, Buffer.from(buffer));

        console.log(`Wrote tile: z=${z}, x=${x}, y=${y}, path=${tilePath}`);
      }
    }
  }

  console.log('Tile generation completed successfully.');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const input = args[0];
  const output = args[1];
  if (!input || !output) {
    console.error('Usage: tsx generate-tiles.ts <inputImage> <outputTileDir>');
    process.exit(1);
  }

  try {
    await generateTiles({
      inputImagePath: input,
      outputTilesDir: output,
      levels: 6,
      tileSize: 256,
    });
  } catch (err) {
    console.error('Error during tile generation:', err);
    process.exit(1);
  }
}

main();
