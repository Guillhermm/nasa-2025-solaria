"use client";

import { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
// import HeaderBar from './HeaderBar';
// import ImageViewer from './ImageViewer';
import { Container } from "@/components/Container";
import { ImageMeta } from "@/types";

import React from "react";
import SideControls from "@/components/SideControls";
import MainContent from "@/components/MainContent";

export default function Home() {
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [current, setCurrent] = useState<ImageMeta | null>(null);

  // Example overlay state
  const [overlays, setOverlays] = useState([
    { id: "dust", name: "Dust Storm", enabled: true },
    { id: "infrared", name: "Infrared Band", enabled: false },
  ]);
  const [zoom, setZoom] = useState<number>(1);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);

  useEffect(() => {
    fetch("/api/images")
      .then((r) => r.json())
      .then((data: ImageMeta[]) => {
        setImages(data);
        if (data.length > 0) setCurrent(data[0]);
      })
      .catch(console.error);
  }, []);

  function handleOverlayToggle(id: string) {
    setOverlays((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
  }

  function handleSearch(query: string) {
    // Basic search: by id or name
    const found = images.find(
      (i) =>
        i.id === query || i.name.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      setCurrent(found);
    }
  }

  return (
    <Container>
      <h1 className="font-mono mb-4">NASA 2025 Solaria</h1>
      <h2 className="font-mono">Embiggen Your Eyes!</h2>
      <div className="font-mono text-sm/6">
        While your cell phone screen can display about three million pixels of
        information and your eye can receive more than ten million pixels, NASA
        images from space are even bigger! NASA’s space missions continue to
        push the boundaries of what is technologically possible, providing
        high-resolution images and videos of Earth, other planets, and space
        with billions or even trillions of pixels. Your challenge is to create a
        platform that allows users to zoom in and out on these massive image
        datasets, label known features, and discover new patterns.
      </div>
      <MainContent />
    </Container>
  );
}
