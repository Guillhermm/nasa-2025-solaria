"use client";

import { Fragment, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Container } from "@/components/Container";
import { ImageMeta } from "../../src/types";

const ImageViewerClient = dynamic(() => import("@/components/ImageViewer"), {
  ssr: false,
});

export default function BEPrototype() {
  const [images, setImages] = useState<ImageMeta[]>([]);

  useEffect(() => {
    fetch("/api/images")
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
      });
  }, []);

  return (
    <Container>
      {images.map((img) => (
        <div key={img.id}>
          <h2>
            {img.name} — {img.mission} — {img.timestamp}
          </h2>
          <ImageViewerClient id={img.id} />
        </div>
      ))}
    </Container>
  );
}
