"use client";

import { useEffect, useRef, useState } from "react";
import OpenSeadragon, { Viewer } from "openseadragon";
import { ImageMeta } from "@/types";

interface ImageViewerProps {
  id: string;
}

export default function ImageViewer({ id }: ImageViewerProps) {
  const viewerRef = useRef<Viewer | null>(null);
  const osdContainerRef = useRef<HTMLDivElement | null>(null);
  const [meta, setMeta] = useState<ImageMeta | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/image/${id}`)
      .then((res) => res.json())
      .then((data: ImageMeta) => setMeta(data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    // only run on client
    if (typeof window === 'undefined') return;

    if (!meta) return;

    console.log("meta", meta);
    if (osdContainerRef.current && !viewerRef.current) {
      viewerRef.current = OpenSeadragon({
        element: osdContainerRef.current,
        prefixUrl: '//openseadragon.github.io/openseadragon/images/',
        tileSources: {
          width: meta.width,
          height: meta.height,
          tileSize: meta.tileSize,
          minLevel: meta.minLevel,
          maxLevel: meta.maxLevel,
          getTileUrl: (level, x, y) => {
            return `/tiles/${meta.id}/${level}/${x}/${y}.jpg`;
          },
        }
      });
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [meta]);

  return (
    <div ref={osdContainerRef} className="w-100" style={{ height: "500px" }} />
  );
}
