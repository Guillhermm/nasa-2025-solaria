import React from "react";
import { Container } from "@/components/Container";

export default function Home() {
  return (
    <Container>
        <h1 className="font-mono mb-4">NASA 2025 Solaria</h1>
        <h2 className="font-mono">Embiggen Your Eyes!</h2>
        <div className="font-mono text-sm/6">
          While your cell phone screen can display about three million pixels of
          information and your eye can receive more than ten million pixels,
          NASA images from space are even bigger! NASA’s space missions continue
          to push the boundaries of what is technologically possible, providing
          high-resolution images and videos of Earth, other planets, and space
          with billions or even trillions of pixels. Your challenge is to create
          a platform that allows users to zoom in and out on these massive image
          datasets, label known features, and discover new patterns.
        </div>
    </Container>
  );
}
