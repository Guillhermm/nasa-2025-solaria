"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import OpenSeadragon from "openseadragon";
import { Flag, ImageMeta, Position } from "@/types";
import { Button } from "react-bootstrap";

interface SeadragonViewerProps {
  id: string;
  initialFlags?: Flag[];
  onFlagsChange?: (flags: Flag[]) => void;
}

export default function SeadragonViewer({
  id,
  initialFlags = [],
  onFlagsChange,
}: SeadragonViewerProps) {
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [flags, setFlags] = useState<Flag[]>(initialFlags);
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [contextMenuFlag, setContextMenuFlag] = useState<Flag | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);

  // Zoom / viewport state (you may or may not need to store these externally)
  // const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

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

    // Listen to viewport changes
    viewer.addHandler("viewport-change", () => {
      const vp = viewer.viewport;
      const c = vp.getCenter();
      const z = vp.getZoom();
      setCenter({ x: c.x, y: c.y });
      // handleZoomTo(z);
    });

    // Canvas click (to add flags / context menu)
    viewer.addHandler("canvas-click", (evt) => {
      const viewer = viewerRef.current!;
      const vp = viewer.viewport;
      const point = vp.viewerElementToViewportCoordinates(evt.position);
      // convert to image pixel coordinates
      const imgX = point.x * imageMeta.width;
      const imgY = point.y * imageMeta.height;
      // convert to % coords relative to full image
      const pctX = (imgX / imageMeta.width) * 100;
      const pctY = (imgY / imageMeta.height) * 100;

      // Open context menu / modal for adding a flag
      // setContextMenuPos({
      //   x: evt.originalEvent.clientX,
      //   y: evt.originalEvent.clientY,
      // });
      // setShowContextMenu(true);
      // setContextMenuFlag({ id: "", x: pctX, y: pctY, name: "" }); // placeholder flag object to rename / confirm
    });

    // After open, place overlays
    viewer.addHandler("open", () => {
      for (const f of flags) {
        addFlagOverlay(f, viewer);
      }
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [imageMeta]);

  // When flags change, optionally notify parent
  useEffect(() => {
    onFlagsChange?.(flags);
  }, [flags, onFlagsChange]);

  // Function to add overlay element
  const addFlagOverlay = (flag: Flag, viewer: OpenSeadragon.Viewer) => {
    // only run on client
    if (typeof window === "undefined") return;

    if (!imageMeta) return;

    const el = document.createElement("div");
    el.className = "flag-overlay";
    el.innerText = flag.name;
    el.onclick = () => {
      setSelectedFlagId(flag.id);
    };
    el.oncontextmenu = (evt) => {
      evt.preventDefault();
      setContextMenuFlag(flag);
      setShowContextMenu(true);
    };
    // location: convert percentage to image coordinate point
    const px = (flag.x / 100) * imageMeta.width;
    const py = (flag.y / 100) * imageMeta.height;
    viewer.addOverlay({
      element: el,
      location: new OpenSeadragon.Point(px, py),
      placement: OpenSeadragon.Placement.CENTER, // or TOP_LEFT, etc
      checkResize: false,
    });
  };

  // Handler to confirm new flag from context menu
  const handleAddFlagConfirm = (name: string) => {
    if (!contextMenuFlag) return;
    const newId = `flag-${Date.now()}`;
    const newFlag: Flag = {
      id: newId,
      x: contextMenuFlag.x,
      y: contextMenuFlag.y,
      name,
    };
    setFlags((prev) => [...prev, newFlag]);
    setShowContextMenu(false);
    // also immediately overlay it
    if (viewerRef.current) addFlagOverlay(newFlag, viewerRef.current);
  };

  // Handler delete / rename from context menu
  const handleDeleteFlag = () => {
    if (!contextMenuFlag) return;
    setFlags((prev) => prev.filter((f) => f.id !== contextMenuFlag.id));
    setShowContextMenu(false);
    // ideally remove overlay element too
    if (viewerRef.current) {
      // find overlay element by matching innerText or ID and remove
      // @ts-expect-error Wrong type to be fixed later.
      const overlays = viewerRef.current.overlays;
      for (const ov of overlays) {
        const el = ov.element as HTMLElement;
        if (el.innerText === contextMenuFlag.name) {
          viewerRef.current.removeOverlay(el);
        }
      }
    }
  };

  // Context menu render
  const renderContextMenu = () => {
    if (!showContextMenu || !contextMenuFlag) return null;
    const isExisting = flags.some((f) => f.id === contextMenuFlag.id);
    return (
      <div
        className="context-menu"
        style={{
          position: "fixed",
          left: contextMenuPos.x,
          top: contextMenuPos.y,
          backgroundColor: "white",
          border: "1px solid gray",
          zIndex: 10000,
        }}
      >
        {isExisting && (
          <div className="context-menu-item" onClick={() => handleDeleteFlag()}>
            Delete Flag
          </div>
        )}
        <div
          className="context-menu-item"
          onClick={() => {
            const name = prompt("Enter flag name", contextMenuFlag.name || "");
            if (name) {
              handleAddFlagConfirm(name);
            }
          }}
        >
          {isExisting ? "Rename Flag" : "Add Flag"}
        </div>
      </div>
    );
  };

  const handleZoomTo = (percent: number) => {
    if (!viewerRef.current) return;
    const vp = viewerRef.current.viewport;
    const zoomFactor = percent / 100; // depends on your scale system
    vp.zoomTo(zoomFactor, vp.getCenter(), true);
    // Update UI
    setScale(zoomFactor);
  };

  const handleReset = () => {
    if (!viewerRef.current) return;
    viewerRef.current.viewport.goHome();
  };

  return (
    <div className="image-viewer-container position-relative">
      <div className="w-100 my-4" style={{ height: "500px" }}>
        <div
          ref={containerRef}
          className="w-100 bg-black"
          style={{ height: "100%" }}
        />
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
          className="btn btn-danger text-uppercase fw-bold"
        >
          Reset View
        </Button>
      </div>
      {/* Floating status */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          zIndex: 1000,
        }}
      >
        Zoom: {scale.toFixed(2)} | Center: ({center.x.toFixed(2)},{" "}
        {center.y.toFixed(2)})
      </div>
      {/* {renderContextMenu()} */}
    </div>
  );
}
