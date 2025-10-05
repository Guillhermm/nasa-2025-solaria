"use client";

import NasaGallery from "./NasaGallery";
import SeadragonViewer from "./SeadragonViewer";
import SectionDivider from "./SectionDivider";

export default function MainContent() {
  const sampleImages = [
    {
      id: "andromeda",
      title: "Andromeda Galaxy",
      url: "https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg",
    },
    {
      id: "jupiter_pia22946",
      title: "Jupiter (PIA22946)",
      url: "https://images-assets.nasa.gov/image/PIA22946/PIA22946~orig.jpg",
    },
    {
      id: "neptune_pia01492",
      title: "Neptune (PIA01492)",
      url: "https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg",
    },
  ];    

  return (
    <>
      <SectionDivider />
      <SeadragonViewer title="1. Deep Viewer" id="hubble-mosaic-high" />
      <SectionDivider />
      <NasaGallery title="2. Spectral Gallery" images={sampleImages} />
    </>
  );
}
