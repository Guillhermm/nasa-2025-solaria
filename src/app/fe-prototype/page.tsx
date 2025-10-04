'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Types
interface ImageResolution {
  level: number;
  name: string;
  url: string;
  width: number;
}

interface Flag {
  id: string;
  x: number;
  y: number;
  name: string;
}

interface Position {
  x: number;
  y: number;
}

// Constants
const IMAGE_RESOLUTIONS: ImageResolution[] = [
  { level: 100, name: "Small", url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~small.jpg", width: 640 },
  { level: 150, name: "Medium", url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~medium.jpg", width: 1024 },
  { level: 300, name: "Large", url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~large.jpg", width: 2048 },
  { level: 600, name: "High-Res", url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg", width: 4096 },
  { level: 1200, name: "Ultra High-Res", url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg", width: 8192 },
  { level: 2400, name: "Maximum Resolution", url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg", width: 16384 }
];

const NASAImageViewer: React.FC = () => {
  // Refs
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const nasaImageRef = useRef<HTMLImageElement>(null);
  const minimapContainerRef = useRef<HTMLDivElement>(null);
  const minimapImageRef = useRef<HTMLImageElement>(null);
  const minimapViewportRef = useRef<HTMLDivElement>(null);

  // State
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [currentResolutionIndex, setCurrentResolutionIndex] = useState<number>(0);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [showFlagModal, setShowFlagModal] = useState<boolean>(false);
  const [flagModalPosition, setFlagModalPosition] = useState<Position>({ x: 0, y: 0 });
  const [flagModalName, setFlagModalName] = useState<string>('New Flag');
  const [editingFlag, setEditingFlag] = useState<Flag | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<Position>({ x: 0, y: 0 });
  const [contextMenuFlag, setContextMenuFlag] = useState<Flag | null>(null);

  // Drag state
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const initialDistanceRef = useRef<number | null>(null);
  const isMinimapDraggingRef = useRef<boolean>(false);
  const minimapStartRef = useRef<Position>({ x: 0, y: 0 });

  // Generate unique ID for flags
  const generateFlagId = useCallback(() => {
    return `flag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Update transform
  const updateTransform = useCallback(() => {
    if (imageContainerRef.current) {
      imageContainerRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
    }
  }, [position, scale]);

  // Update minimap viewport
  const updateMinimapViewport = useCallback(() => {
    const viewer = viewerRef.current;
    const nasaImage = nasaImageRef.current;
    const minimapContainer = minimapContainerRef.current;
    const minimapViewport = minimapViewportRef.current;

    if (!viewer || !nasaImage || !minimapContainer || !minimapViewport) return;

    const viewerRect = viewer.getBoundingClientRect();
    const imageRect = nasaImage.getBoundingClientRect();
    const minimapRect = minimapContainer.getBoundingClientRect();

    // Calculate the actual displayed image dimensions
    const displayedImageWidth = Math.min(imageRect.width, viewerRect.width);
    const displayedImageHeight = Math.min(imageRect.height, viewerRect.height);

    // Calculate the visible area in the main viewer
    const visibleWidth = viewerRect.width / scale;
    const visibleHeight = viewerRect.height / scale;

    // Calculate what portion of the image is currently visible
    const visiblePortionWidth = Math.min(visibleWidth / displayedImageWidth, 1);
    const visiblePortionHeight = Math.min(visibleHeight / displayedImageHeight, 1);

    // Calculate the image offsets (for centering)
    const imageOffsetX = (viewerRect.width - displayedImageWidth) / 2;
    const imageOffsetY = (viewerRect.height - displayedImageHeight) / 2;

    // Calculate the visible area's position in image coordinates
    const visibleX = (-position.x / scale - imageOffsetX) / displayedImageWidth;
    const visibleY = (-position.y / scale - imageOffsetY) / displayedImageHeight;

    // Convert to minimap coordinates
    const viewportWidth = Math.max(visiblePortionWidth * minimapRect.width, 10);
    const viewportHeight = Math.max(visiblePortionHeight * minimapRect.height, 10);

    const viewportX = Math.max(0, Math.min(visibleX * minimapRect.width, minimapRect.width - viewportWidth));
    const viewportY = Math.max(0, Math.min(visibleY * minimapRect.height, minimapRect.height - viewportHeight));

    // Apply the calculated values to the viewport rectangle
    minimapViewport.style.width = `${viewportWidth}px`;
    minimapViewport.style.height = `${viewportHeight}px`;
    minimapViewport.style.left = `${viewportX}px`;
    minimapViewport.style.top = `${viewportY}px`;
  }, [position, scale]);

  // Check and update resolution
  const checkResolution = useCallback(() => {
    const zoomPercent = scale * 100;
    let targetResolutionIndex = 0;

    for (let i = IMAGE_RESOLUTIONS.length - 1; i >= 0; i--) {
      if (zoomPercent >= IMAGE_RESOLUTIONS[i].level) {
        targetResolutionIndex = i;
        break;
      }
    }

    if (targetResolutionIndex !== currentResolutionIndex && !isImageLoading) {
      loadImageResolution(targetResolutionIndex);
    }
  }, [scale, currentResolutionIndex, isImageLoading]);

  // Load image resolution
  const loadImageResolution = useCallback((resolutionIndex: number) => {
    setIsImageLoading(true);
    setCurrentResolutionIndex(resolutionIndex);
    const resolution = IMAGE_RESOLUTIONS[resolutionIndex];

    const newImage = new Image();
    newImage.onload = () => {
      if (nasaImageRef.current && minimapImageRef.current) {
        nasaImageRef.current.src = newImage.src;
        minimapImageRef.current.src = newImage.src;
        
        setTimeout(() => {
          setIsImageLoading(false);
          updateMinimapViewport();
        }, 300);
      }
    };

    newImage.onerror = () => {
      console.error("Failed to load image:", resolution.url);
      setIsImageLoading(false);
      setCurrentResolutionIndex(Math.max(0, resolutionIndex - 1));
    };

    newImage.src = resolution.url;
  }, [updateMinimapViewport]);

  // Get image position from click
  const getImagePositionFromClick = useCallback((clientX: number, clientY: number): Position => {
    const viewer = viewerRef.current;
    const nasaImage = nasaImageRef.current;

    if (!viewer || !nasaImage) return { x: 0, y: 0 };

    const viewerRect = viewer.getBoundingClientRect();
    const imageRect = nasaImage.getBoundingClientRect();

    // Calculate the actual displayed image dimensions
    const displayedImageWidth = Math.min(imageRect.width, viewerRect.width);
    const displayedImageHeight = Math.min(imageRect.height, viewerRect.height);

    // Calculate the image offsets (for centering)
    const imageOffsetX = (viewerRect.width - displayedImageWidth) / 2;
    const imageOffsetY = (viewerRect.height - displayedImageHeight) / 2;

    // Calculate the click position relative to the transformed image
    const transformedX = (clientX - viewerRect.left - position.x) / scale;
    const transformedY = (clientY - viewerRect.top - position.y) / scale;

    // Convert to percentage coordinates relative to the displayed image
    const percentX = ((transformedX - imageOffsetX) / displayedImageWidth) * 100;
    const percentY = ((transformedY - imageOffsetY) / displayedImageHeight) * 100;

    return {
      x: Math.max(0, Math.min(100, percentX)),
      y: Math.max(0, Math.min(100, percentY))
    };
  }, [position, scale]);

  // Flag management
  const addFlag = useCallback((x: number, y: number, name: string) => {
    const newFlag: Flag = {
      id: generateFlagId(),
      x,
      y,
      name
    };
    
    setFlags(prev => [...prev, newFlag]);
  }, [generateFlagId]);

  const updateFlag = useCallback((flagId: string, newName: string) => {
    setFlags(prev => prev.map(flag => 
      flag.id === flagId ? { ...flag, name: newName } : flag
    ));
  }, []);

  const removeFlag = useCallback((flagId: string) => {
    setFlags(prev => prev.filter(flag => flag.id !== flagId));
  }, []);

  // Zoom functions
  const setZoom = useCallback((zoomPercent: number, clientX?: number, clientY?: number) => {
    const newScale = Math.max(1, zoomPercent / 100);
    const prevScale = scale;

    if (clientX !== undefined && clientY !== undefined && viewerRef.current) {
      const rect = viewerRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      setPosition(prev => ({
        x: prev.x - (mouseX - prev.x) * (newScale / prevScale - 1),
        y: prev.y - (mouseY - prev.y) * (newScale / prevScale - 1)
      }));
    }

    setScale(newScale);
  }, [scale]);

  const zoom = useCallback((direction: number, clientX: number, clientY: number) => {
    const zoomIntensity = 0.1;
    const prevScale = scale;

    let newScale = direction > 0 ? scale * (1 + zoomIntensity) : scale / (1 + zoomIntensity);
    newScale = Math.min(Math.max(1, newScale), 50);

    if (viewerRef.current) {
      const rect = viewerRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      setPosition(prev => ({
        x: prev.x - (mouseX - prev.x) * (newScale / prevScale - 1),
        y: prev.y - (mouseY - prev.y) * (newScale / prevScale - 1)
      }));
    }

    setScale(newScale);
  }, [scale]);

  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    if (viewerRef.current) {
      viewerRef.current.style.cursor = 'grabbing';
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (viewerRef.current) {
      viewerRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const direction = e.deltaY > 0 ? -1 : 1;
    zoom(direction, e.clientX, e.clientY);
  }, [zoom]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    // Check if we clicked on a flag
    const target = e.target as HTMLElement;
    if (target.classList.contains('flag') || target.classList.contains('flag-label')) {
      return;
    }

    const imagePos = getImagePositionFromClick(e.clientX, e.clientY);
    
    if (imagePos.x >= 0 && imagePos.x <= 100 && imagePos.y >= 0 && imagePos.y <= 100) {
      setFlagModalPosition(imagePos);
      setFlagModalName('New Flag');
      setEditingFlag(null);
      setShowFlagModal(true);
    }
  }, [getImagePositionFromClick]);

  const handleFlagContextMenu = useCallback((e: React.MouseEvent, flag: Flag) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenuPosition({ x: e.pageX, y: e.pageY });
    setContextMenuFlag(flag);
    setShowContextMenu(true);
  }, []);

  const handleMinimapMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== minimapViewportRef.current) return;
    
    e.stopPropagation();
    isMinimapDraggingRef.current = true;
    const viewportRect = minimapViewportRef.current?.getBoundingClientRect();
    if (viewportRect) {
      minimapStartRef.current = {
        x: e.clientX - viewportRect.left,
        y: e.clientY - viewportRect.top
      };
    }
    if (minimapViewportRef.current) {
      minimapViewportRef.current.style.cursor = 'grabbing';
    }
  }, []);

  const handleMinimapClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== minimapImageRef.current || isMinimapDraggingRef.current) return;
    
    const minimapContainer = minimapContainerRef.current;
    const minimapViewport = minimapViewportRef.current;
    
    if (!minimapContainer || !minimapViewport) return;

    const minimapRect = minimapContainer.getBoundingClientRect();
    const viewportRect = minimapViewport.getBoundingClientRect();

    const clickX = e.clientX - minimapRect.left;
    const clickY = e.clientY - minimapRect.top;

    const newX = clickX - viewportRect.width / 2;
    const newY = clickY - viewportRect.height / 2;

    updateMainViewFromMinimap(newX, newY);
  }, []);

  const updateMainViewFromMinimap = useCallback((viewportX: number, viewportY: number) => {
    const viewer = viewerRef.current;
    const nasaImage = nasaImageRef.current;
    const minimapContainer = minimapContainerRef.current;

    if (!viewer || !nasaImage || !minimapContainer) return;

    const viewerRect = viewer.getBoundingClientRect();
    const imageRect = nasaImage.getBoundingClientRect();
    const minimapRect = minimapContainer.getBoundingClientRect();

    const displayedImageWidth = Math.min(imageRect.width, viewerRect.width);
    const displayedImageHeight = Math.min(imageRect.height, viewerRect.height);

    const imageX = (viewportX / minimapRect.width) * displayedImageWidth;
    const imageY = (viewportY / minimapRect.height) * displayedImageHeight;

    const imageOffsetX = (viewerRect.width - displayedImageWidth) / 2;
    const imageOffsetY = (viewerRect.height - displayedImageHeight) / 2;

    setPosition({
      x: -(imageX + imageOffsetX) * scale,
      y: -(imageY + imageOffsetY) * scale
    });
  }, [scale]);

  // Close context menu when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (showContextMenu) {
      setShowContextMenu(false);
      setContextMenuFlag(null);
    }
  }, [showContextMenu]);

  // Effects
  useEffect(() => {
    updateTransform();
    updateMinimapViewport();
    checkResolution();
  }, [updateTransform, updateMinimapViewport, checkResolution]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleMouseMove, handleMouseUp, handleClickOutside]);

  useEffect(() => {
    const handleMinimapMouseMove = (e: MouseEvent) => {
      if (!isMinimapDraggingRef.current || !minimapContainerRef.current || !minimapViewportRef.current) return;

      const minimapRect = minimapContainerRef.current.getBoundingClientRect();
      const viewportRect = minimapViewportRef.current.getBoundingClientRect();

      let newX = e.clientX - minimapRect.left - minimapStartRef.current.x;
      let newY = e.clientY - minimapRect.top - minimapStartRef.current.y;

      newX = Math.max(0, Math.min(newX, minimapRect.width - viewportRect.width));
      newY = Math.max(0, Math.min(newY, minimapRect.height - viewportRect.height));

      updateMainViewFromMinimap(newX, newY);
    };

    const handleMinimapMouseUp = () => {
      isMinimapDraggingRef.current = false;
      if (minimapViewportRef.current) {
        minimapViewportRef.current.style.cursor = 'move';
      }
    };

    document.addEventListener('mousemove', handleMinimapMouseMove);
    document.addEventListener('mouseup', handleMinimapMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMinimapMouseMove);
      document.removeEventListener('mouseup', handleMinimapMouseUp);
    };
  }, [updateMainViewFromMinimap]);

  useEffect(() => {
    // Add sample flags
    const timer = setTimeout(() => {
      addFlag(25, 30, "Interesting Feature");
      addFlag(60, 45, "Anomaly");
      addFlag(75, 70, "Research Area");
    }, 1000);

    return () => clearTimeout(timer);
  }, [addFlag]);

  // Modal and context menu handlers
  const handleAddFlag = () => {
    if (flagModalName.trim()) {
      addFlag(flagModalPosition.x, flagModalPosition.y, flagModalName.trim());
      setShowFlagModal(false);
    }
  };

  const handleRenameFlag = () => {
    if (contextMenuFlag && flagModalName.trim()) {
      updateFlag(contextMenuFlag.id, flagModalName.trim());
      setShowFlagModal(false);
      setShowContextMenu(false);
    }
  };

  const handleDeleteFlag = () => {
    if (contextMenuFlag) {
      removeFlag(contextMenuFlag.id);
      setShowFlagModal(false);
      setShowContextMenu(false);
    }
  };

  return (
    <div className="nasa-image-viewer">
      <header>
        <h1>NASA Image Viewer with Annotation Flags</h1>
        <p className="subtitle">Explore massive NASA images and add annotations with flags</p>
      </header>

      <div className="container">
        <div 
          ref={viewerRef}
          className="viewer-container"
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
        >
          {isImageLoading && (
            <div className="loading-overlay active">
              <div className="spinner"></div>
            </div>
          )}
          <div ref={imageContainerRef} className="image-container">
            <img 
              ref={nasaImageRef}
              src={IMAGE_RESOLUTIONS[0].url}
              alt="NASA Mars Rover Image"
              className="nasa-image"
            />
            {flags.map(flag => (
              <div
                key={flag.id}
                className="flag"
                style={{ left: `${flag.x}%`, top: `${flag.y}%` }}
                onContextMenu={(e) => handleFlagContextMenu(e, flag)}
              >
                <div className="flag-label">{flag.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div 
          ref={minimapContainerRef}
          className="minimap-container"
          onMouseDown={handleMinimapClick}
        >
          <img 
            ref={minimapImageRef}
            src={IMAGE_RESOLUTIONS[0].url}
            alt="Minimap"
            className="minimap-image"
          />
          <div 
            ref={minimapViewportRef}
            className="minimap-viewport"
            onMouseDown={handleMinimapMouseDown}
          />
          {flags.map(flag => (
            <div
              key={`minimap-${flag.id}`}
              className="minimap-flag"
              style={{ left: `${flag.x}%`, top: `${flag.y}%` }}
            />
          ))}
        </div>

        <div className="controls">
          <div className="zoom-controls">
            <div className="zoom-slider-container">
              <span>100%</span>
              <input
                type="range"
                min="100"
                max="5000"
                value={Math.round(scale * 100)}
                className="zoom-slider"
                onChange={(e) => setZoom(parseInt(e.target.value))}
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
                onChange={(e) => setZoom(parseInt(e.target.value))}
              />
              <span>%</span>
            </div>
            <button id="reset" onClick={resetView}>Reset</button>
          </div>
          <div className="resolution-info">
            Resolution: {IMAGE_RESOLUTIONS[currentResolutionIndex].name} ({IMAGE_RESOLUTIONS[currentResolutionIndex].width}px)
          </div>
        </div>
      </div>

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="flag-modal">
          <h3>{editingFlag ? 'Rename Flag' : 'Add New Flag'}</h3>
          <input
            type="text"
            className="flag-input"
            value={flagModalName}
            onChange={(e) => setFlagModalName(e.target.value)}
            placeholder="Enter flag name"
            autoFocus
          />
          <div className="flag-modal-buttons">
            {editingFlag && (
              <button className="modal-button danger" onClick={handleDeleteFlag}>
                Delete
              </button>
            )}
            <button className="modal-button secondary" onClick={() => setShowFlagModal(false)}>
              Cancel
            </button>
            <button className="modal-button primary" onClick={editingFlag ? handleRenameFlag : handleAddFlag}>
              {editingFlag ? 'Save' : 'Add Flag'}
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && contextMenuFlag && (
        <div 
          className="context-menu"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <div 
            className="context-menu-item"
            onClick={() => {
              setEditingFlag(contextMenuFlag);
              setFlagModalName(contextMenuFlag.name);
              setShowFlagModal(true);
              setShowContextMenu(false);
            }}
          >
            Rename Flag
          </div>
          <div 
            className="context-menu-item"
            onClick={() => {
              removeFlag(contextMenuFlag.id);
              setShowContextMenu(false);
            }}
          >
            Remove Flag
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h2>How It Works</h2>
        <p>This viewer loads increasingly higher resolution images as you zoom in:</p>
        <ul>
          <li><strong>Zoom Level 100-150%:</strong> Small image (640px)</li>
          <li><strong>Zoom Level 150-300%:</strong> Medium image (1024px)</li>
          <li><strong>Zoom Level 300-600%:</strong> Large image (2048px)</li>
          <li><strong>Zoom Level 600-1200%:</strong> High-Res (4096px)</li>
          <li><strong>Zoom Level 1200-2400%:</strong> Ultra High-Res (8192px)</li>
          <li><strong>Zoom Level 2400%+:</strong> Maximum Resolution (16384px)</li>
        </ul>
        <p><strong>Right-click</strong> anywhere on the image to add a flag annotation.</p>
        <p><strong>Right-click</strong> on an existing flag to rename or remove it.</p>
        <p>All flags appear as red dots on the minimap.</p>
      </div>
    </div>
  );
};

export default NASAImageViewer;