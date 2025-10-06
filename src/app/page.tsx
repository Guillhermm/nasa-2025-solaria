import { Container } from "@/components/Container";
import SectionDivider from "@/components/SectionDivider";
import DeepViewer from "@/components/tools/DeepViewer";
import ImageComparisonSlider from "@/components/tools/ImageComparisonSlider";
import SpectralGallery from "@/components/tools/SpectralGallery";

export default function Home() {
  const sampleImages = [
    {
      id: "sun_pia22946",
      title: "Sun (PIA03149)",
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

  const comparisonImages = [
    {
      src: "https://assets.science.nasa.gov/dynamicimage/assets/science/missions/webb/science/2025/07/STScI-01K0W69T4CK5TD4EZF8RCRRJ2Z.png",
      alt: "Image 1",
      title: "Before",
      slot: "first",
    },
    {
      src: "https://assets.science.nasa.gov/dynamicimage/assets/science/missions/webb/science/2025/07/STScI-01K0W7HK9320DCD8PTZQ55FKWV.png",
      alt: "Image 2",
      title: "After",
      slot: "second",
    },
  ];

  return (
    <Container>
      <h1 className="mb-4">NASA 2025 Solaria</h1>
      <h2 className="">Explore the Universe in Unprecedented Detail</h2>
      <div className="fs-5">
        NASA{`\’`}s space missions produce some of the largest and most detailed
        images ever captured, far beyond what your screen, or even your eyes,
        can take in at once. With Solaria, you can explore, zoom,
        compare, and analyze these ultra-high-resolution images in different ways.
      </div>
      <SectionDivider />
      <DeepViewer title="1. Deep Viewer" id="hubble-mosaic-high" />
      <SectionDivider />
      <ImageComparisonSlider
        title="2. Comparison Slider"
        subtitle="Nebula Giant Cloud"
        images={comparisonImages}
      />
      <SectionDivider />
      <SpectralGallery title="3. Spectral Gallery" images={sampleImages} />
    </Container>
  );
}
