'use client';

import { ImgComparisonSlider } from "@img-comparison-slider/react";

export default function ImageComparisonSlider({
  title,
  images,
}: {
  title: string;
  images: { src: string; alt: string; title: string; slot: string }[];
}) {
  return (
    <>
      <h3>{title}</h3>
      <div className="mb-4">This interactive comparison slider allows you to explore these images side by side, providing a deeper understanding of Earth{`\'`}s diverse landscapes and the technological advancements that enable us to observe our planet from such unique vantage points.</div>
      <ImgComparisonSlider className="w-100 h-400px h-md-700px">
        {images.map((image, idx) => (
          <figure key={idx} slot={image.slot}>
            <img
              src={image.src}
              alt={image.alt}
              title={image.title}
              className="w-100 h-400px h-md-700px"
            />
          </figure>
        ))}
      </ImgComparisonSlider>
    </>
  );
}
