"use client";

import React, { useEffect, useRef, useState } from "react";
import OpenSeadragon from "openseadragon";
import { Button } from "react-bootstrap";
import { DeepViewerProps, ImageMeta } from "@/types";

export default function DeepViewer({
  title,
  id,
}: DeepViewerProps) {
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [center, setCenter] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/image/${id}`)
      .then((res) => res.json())
      .then((data: ImageMeta) => setImageMeta(data))
      .catch(console.error);
  }, [id]);

  // Initialize viewer
  useEffect(() => {
    // only run on client
    if (typeof window === "undefined") return;

    if (!imageMeta) return;
    if (!containerRef.current) return;

    const viewer = OpenSeadragon({
      element: containerRef.current,
      showNavigationControl: false,
      tileSources: {
        width: imageMeta.width,
        height: imageMeta.height,
        tileSize: imageMeta.tileSize,
        minLevel: imageMeta.minLevel,
        maxLevel: imageMeta.maxLevel,
        getTileUrl: (level, x, y) => {
          return `/tiles/${imageMeta.id}/${level}/${x}/${y}.jpg`;
        },
      },
      showZoomControl: false, // maybe disable built‑in controls if you use your own
      showHomeControl: false,
      showRotationControl: false,
      autoHideControls: false,
    });

    viewerRef.current = viewer;

    // Listen to viewport-change to sync UI
    viewer.addHandler("viewport-change", () => {
      const vp = viewer.viewport;
      const z = vp.getZoom(); // this is the internal zoom factor (logical units)
      // convert to percent or scale as you prefer
      const zoomPct = z * 100;
      setScale(zoomPct / 100); // or setScale(z) depending how you interpret it
      // Optionally update center / position if needed
      const c = vp.getCenter();
      setCenter({ x: c.x, y: c.y });
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [imageMeta]);

  const handleZoomTo = (percent: number) => {
    if (!viewerRef.current) return;
    const vp = viewerRef.current.viewport;
    const zoomFactor = percent / 100;
    vp.zoomTo(zoomFactor, vp.getCenter(), true);
  };

  const handleReset = () => {
    if (!viewerRef.current) return;
    viewerRef.current.viewport.goHome();
  };

  return (
    <>
      <h3>{title}</h3>
      <div className="mb-4">Explore every detail, without waiting: our Deep Viewer splits massive images into many small tiles, loading only what you need at your current view. Zoom, pan, or select areas, in which the system will quickly fetch just the right pieces, so you see crisp detail fast, without overloading your browser or network. It is designed to be fast, responsive, and intuitive, so you can spend more time discovering and less time waiting.</div>
      <div className="deep-viewer-container position-relative">
        <div className="w-100 h-400px my-4 h-md-500px">
          <div ref={containerRef} className="w-100 h-400px bg-black h-100" />
        </div>
        {/* Zoom / control buttons */}
        <div className="zoom-controls-section d-flex flex-column gap-3 flex-md-row">
          <div className="zoom-slider-container">
            <span>100%</span>
            <input
              type="range"
              min="100"
              max="5000"
              value={Math.round(scale * 100)}
              className="zoom-slider"
              onChange={(e) => {
                const newPct = parseInt(e.target.value, 10);
                handleZoomTo(newPct);
              }}
            />
            <span>5000%</span>
          </div>
          <div className="zoom-input-container">
            <label htmlFor="zoomInput">Zoom:</label>
            <input
              id="zoomInput"
              type="number"
              min="100"
              max="5000"
              value={Math.round(scale * 100)}
              className="zoom-input"
              onChange={(e) => {
                const newPct = parseInt(e.target.value, 10);
                handleZoomTo(newPct);
              }}
            />
            <span>%</span>
          </div>
          <Button
            id="reset"
            onClick={handleReset}
            size="lg"
            className="btn btn-danger rounded-0 text-uppercase fw-bold"
          >
            Reset View
          </Button>
        </div>
        {/* Floating status */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            color: "white",
            padding: "12px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
        >
          Zoom: {scale.toFixed(2)} | Center: ({center.x.toFixed(2)},{" "}
          {center.y.toFixed(2)})
        </div>
      </div>
    </>
  );
}
