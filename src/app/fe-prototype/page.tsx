'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageResolution {
  level: number;
  name: string;
  url: string;
  width: number;
}

const NASAImageZoomViewer: React.FC = () => {
  // Refs
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const nasaImageRef = useRef<HTMLImageElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);

  // State
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [currentResolutionIndex, setCurrentResolutionIndex] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  // Refs for values that shouldn't trigger re-renders
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialDistanceRef = useRef<number | null>(null);
  const isImageLoadingRef = useRef<boolean>(false);

  // Image resolutions configuration
  const imageResolutions: ImageResolution[] = [
    { 
      level: 100, 
      name: "Small", 
      url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~small.jpg", 
      width: 640 
    },
    { 
      level: 150, 
      name: "Medium", 
      url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~medium.jpg", 
      width: 1024 
    },
    { 
      level: 300, 
      name: "Large", 
      url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~large.jpg", 
      width: 2048 
    },
    { 
      level: 600, 
      name: "High-Res", 
      url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg", 
      width: 4096 
    },
    { 
      level: 1200, 
      name: "Ultra High-Res", 
      url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg", 
      width: 8192 
    },
    { 
      level: 2400, 
      name: "Maximum Resolution", 
      url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg", 
      width: 16384 
    }
  ];

  // Update transform styles
  const updateTransform = useCallback(() => {
    if (imageContainerRef.current) {
      imageContainerRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
    }
  }, [position, scale]);

  // Set zoom level programmatically
  const setZoom = useCallback((zoomPercent: number, clientX?: number, clientY?: number) => {
    const prevScale = scale;
    const newScale = Math.max(1, zoomPercent / 100); // Ensure minimum 100% zoom
    
    setScale(newScale);

    // If coordinates provided, adjust position to zoom toward that point
    if (clientX !== undefined && clientY !== undefined && viewerRef.current) {
      const rect = viewerRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      setPosition(prev => ({
        x: prev.x - (mouseX - prev.x) * (newScale / prevScale - 1),
        y: prev.y - (mouseY - prev.y) * (newScale / prevScale - 1)
      }));
    }
  }, [scale]);

  // Check and load appropriate resolution
  const checkResolution = useCallback(() => {
    const zoomPercent = scale * 100;
    let targetResolutionIndex = 0;

    // Determine which resolution we should be using
    for (let i = imageResolutions.length - 1; i >= 0; i--) {
      if (zoomPercent >= imageResolutions[i].level) {
        targetResolutionIndex = i;
        break;
      }
    }

    // If resolution needs to change and we're not already loading
    if (targetResolutionIndex !== currentResolutionIndex && !isImageLoadingRef.current) {
      loadImageResolution(targetResolutionIndex);
    }
  }, [scale, currentResolutionIndex]);

  // Load specific image resolution
  const loadImageResolution = useCallback(async (resolutionIndex: number) => {
    setIsImageLoading(true);
    isImageLoadingRef.current = true;
    setCurrentResolutionIndex(resolutionIndex);
    
    const resolution = imageResolutions[resolutionIndex];

    // Show loading indicator
    if (loadingOverlayRef.current) {
      loadingOverlayRef.current.classList.add('active');
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const newImage = new Image();
        newImage.onload = () => {
          if (nasaImageRef.current) {
            nasaImageRef.current.src = newImage.src;
          }
          resolve();
        };
        newImage.onerror = reject;
        newImage.src = resolution.url;
      });

      // Hide loading indicator after a delay
      setTimeout(() => {
        if (loadingOverlayRef.current) {
          loadingOverlayRef.current.classList.remove('active');
        }
        setIsImageLoading(false);
        isImageLoadingRef.current = false;
      }, 300);

      console.log(`Loaded ${resolution.name} resolution (${resolution.width}px)`);
    } catch (error) {
      console.error("Failed to load image:", resolution.url);
      if (loadingOverlayRef.current) {
        loadingOverlayRef.current.classList.remove('active');
      }
      setIsImageLoading(false);
      isImageLoadingRef.current = false;
      
      // Fall back to previous resolution
      setCurrentResolutionIndex(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Zoom function
  const zoom = useCallback((direction: number, clientX?: number, clientY?: number) => {
    const zoomIntensity = 0.1;
    const prevScale = scale;
    let newScale: number;

    if (direction > 0) {
      newScale = scale * (1 + zoomIntensity);
    } else {
      // Don't allow zooming below 100%
      newScale = Math.max(1, scale / (1 + zoomIntensity));
    }

    // Limit maximum zoom
    newScale = Math.min(newScale, 50);
    setScale(newScale);

    // Calculate mouse position relative to image and adjust position
    if (clientX !== undefined && clientY !== undefined && viewerRef.current && direction !== 0) {
      const rect = viewerRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      setPosition(prev => ({
        x: prev.x - (mouseX - prev.x) * (newScale / prevScale - 1),
        y: prev.y - (mouseY - prev.y) * (newScale / prevScale - 1)
      }));
    }
  }, [scale]);

  // Reset view
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
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

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    zoom(direction, e.clientX, e.clientY);
  }, [zoom]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch for dragging
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    } else if (e.touches.length === 2) {
      // Two touches for pinch zoom
      initialDistanceRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // Single touch drag
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
    } else if (e.touches.length === 2 && initialDistanceRef.current !== null) {
      // Pinch zoom
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      if (initialDistanceRef.current > 0) {
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        const direction = currentDistance < initialDistanceRef.current ? -1 : 1;
        zoom(direction, centerX, centerY);
      }

      initialDistanceRef.current = currentDistance;
    }
  }, [isDragging, zoom]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    initialDistanceRef.current = null;
  }, []);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseInt(e.target.value));
  }, [setZoom]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) return;

    // Ensure value is within bounds
    value = Math.max(100, Math.min(5000, value));
    setZoom(value);
  }, [setZoom]);

  // Effects
  useEffect(() => {
    updateTransform();
    checkResolution();
  }, [updateTransform, checkResolution]);

  useEffect(() => {
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add wheel event listener to viewer
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (viewer) {
        viewer.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  // Get current resolution info
  const currentResolution = imageResolutions[currentResolutionIndex];

  return (
    <div className="nasa-image-viewer">
      <header>
        <h1>NASA Ultra High-Res Zoom Viewer</h1>
        <p className="subtitle">Explore massive NASA images with progressive resolution loading</p>
      </header>
      
      <div className="container">
        <div 
          ref={viewerRef}
          className="viewer-container"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div ref={loadingOverlayRef} className="loading-overlay">
            <div className="spinner"></div>
          </div>
          <div ref={imageContainerRef} className="image-container">
            <img 
              ref={nasaImageRef}
              src={imageResolutions[0].url}
              alt="NASA Mars Rover Image"
              className="nasa-image"
            />
          </div>
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
                onChange={handleSliderChange}
              />
              <span>5000%</span>
            </div>
            <div className="zoom-input-container">
              <label htmlFor="zoomInput">Zoom:</label>
              <input 
                type="number" 
                min="100" 
                max="5000" 
                value={Math.round(scale * 100)}
                className="zoom-input" 
                id="zoomInput"
                onChange={handleInputChange}
              />
              <span>%</span>
            </div>
            <button onClick={resetView}>Reset</button>
          </div>
          <div className="resolution-info">
            Resolution: {currentResolution.name} ({currentResolution.width}px)
          </div>
        </div>
      </div>
      
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
        <p>Use the slider or input field to control zoom. Minimum zoom is 100%.</p>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .nasa-image-viewer {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0b3c5d 0%, #1d2731 100%);
          color: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        
        header {
          text-align: center;
          margin-bottom: 30px;
          width: 100%;
          max-width: 1200px;
        }
        
        h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .subtitle {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-bottom: 20px;
        }
        
        .container {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 1200px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .viewer-container {
          position: relative;
          width: 100%;
          height: 70vh;
          overflow: hidden;
          background: #000;
          cursor: grab;
          touch-action: none;
        }
        
        .viewer-container:active {
          cursor: grabbing;
        }
        
        .image-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: 0 0;
          transition: transform 0.1s ease-out;
        }
        
        .nasa-image {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        
        .loading-overlay.active {
          opacity: 1;
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #4facfe;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 15px;
          width: 100%;
        }
        
        .zoom-slider-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .zoom-slider {
          flex: 1;
          -webkit-appearance: none;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          outline: none;
        }
        
        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4facfe;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .zoom-slider::-webkit-slider-thumb:hover {
          background: #00f2fe;
          transform: scale(1.1);
        }
        
        .zoom-input-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .zoom-input {
          width: 70px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          color: white;
          font-size: 16px;
          text-align: center;
        }
        
        .zoom-input:focus {
          outline: none;
          border-color: #4facfe;
        }
        
        button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 15px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }
        
        button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        .resolution-info {
          font-size: 14px;
          opacity: 0.8;
          margin-left: 20px;
        }
        
        .instructions {
          margin-top: 20px;
          text-align: center;
          max-width: 800px;
          line-height: 1.6;
          opacity: 0.8;
        }
        
        .instructions h2 {
          margin-bottom: 10px;
          color: #4facfe;
        }
        
        .instructions ul {
          text-align: left;
          display: inline-block;
          margin-top: 10px;
        }
        
        .instructions li {
          margin-bottom: 8px;
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .controls {
            flex-direction: column;
            gap: 15px;
          }
          
          .zoom-controls {
            flex-direction: column;
            width: 100%;
            gap: 15px;
          }
          
          .zoom-slider-container {
            width: 100%;
          }
          
          .resolution-info {
            margin-left: 0;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default NASAImageZoomViewer;