"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "react-bootstrap";
import { BsAlexa, BsFullscreen, BsFullscreenExit } from "react-icons/bs";
import OpenSeadragon from "openseadragon";
import { DeepViewerProps, ImageMeta } from "@/types";

export default function DeepViewer({ title, id }: DeepViewerProps) {
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [center, setCenter] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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
      showZoomControl: false,
      showHomeControl: false,
      showRotationControl: false,
      showNavigationControl: false,
      autoHideControls: false,
      showNavigator: true,
      navigatorPosition: "BOTTOM_RIGHT",
      navigatorSizeRatio: 0.2,
      navigatorMaintainSizeRatio: false,
      navigatorBackground: "#000",
      navigatorOpacity: 0.8,
    });

    viewerRef.current = viewer;

    const handler = () => {
      const vp = viewer.viewport;
      const z = vp.getZoom();
      setScale(z);
      const c = vp.getCenter();
      setCenter({ x: c.x, y: c.y });
    };

    // Listen to viewport-change to sync UI
    viewer.addHandler("viewport-change", handler);

    return () => {
      viewer.removeHandler("viewport-change", handler);
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [imageMeta]);

  const handleZoomTo = useCallback((percent: number) => {
    if (!viewerRef.current) return;
    const vp = viewerRef.current.viewport;
    vp.zoomTo(percent / 100, vp.getCenter(), true);
  }, []);

  const handleReset = useCallback(() => {
    if (!viewerRef.current) return;
    viewerRef.current.viewport.goHome();
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!wrapperRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await wrapperRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);
    }
  }, [setIsFullscreen]);

  return (
    <>
      <h3>{title}</h3>
      <div className="mb-4">
        Explore every detail, without waiting: our Deep Viewer splits massive
        images into many small tiles, loading only what you need at your current
        view. Zoom, pan, or select areas, in which the system will quickly fetch
        just the right pieces, so you see crisp detail fast, without overloading
        your browser or network. It is designed to be fast, responsive, and
        intuitive, so you can spend more time discovering and less time waiting.
      </div>

      <div className="deep-viewer-container position-relative" ref={wrapperRef}>
        <div
          className={`w-100 my-4 ${
            isFullscreen ? "fullscreen-viewer" : "h-400px h-md-500px"
          }`}
        >
          <div ref={containerRef} className="w-100 bg-black h-100" />
        </div>
        {/* Zoom / control buttons */}
        <div
          className={`zoom-controls-section d-flex flex-column gap-3 flex-md-row ${
            isFullscreen
              ? "position-absolute px-4 pb-4 w-100 left-0 right-0 bottom-0"
              : ""
          }`}
        >
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
            id="full-screen"
            onClick={toggleFullscreen}
            size="lg"
            className="btn btn-info rounded-0 text-uppercase fw-bold text-white d-flex align-items-center justify-content-center gap-2"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <>
                <BsFullscreenExit />
                Exit Fullscreen
              </>
            ) : (
              <>
                <BsFullscreen />
                Fullscreen
              </>
            )}
          </Button>
          <Button
            id="reset"
            onClick={handleReset}
            size="lg"
            className="btn btn-danger rounded-0 text-uppercase fw-bold d-flex align-items-center justify-content-center gap-2"
            title="Reset View"
          >
            <BsAlexa />
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
