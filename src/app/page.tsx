import { Container } from "@/components/Container";
import SectionDivider from "@/components/SectionDivider";
import DeepViewer from "@/components/tools/DeepViewer";
import SpectralGallery from "@/components/tools/SpectralGallery";

export default function Home() {
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
      <SectionDivider />
      <DeepViewer title="1. Deep Viewer" id="hubble-mosaic-high" />
      <SectionDivider />
      <SpectralGallery title="2. Spectral Gallery" images={sampleImages} />
    </Container>
  );
}
