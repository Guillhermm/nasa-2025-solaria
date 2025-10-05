import React from "react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[16px] row-start-2 items-center sm:items-start">
        <div className="container max-w-3xl">
          <h1 className="font-mono mb-4">NASA 2025 Solaria</h1>
          <h2 className="font-mono">Embiggen Your Eyes!</h2>
          <div className="font-mono text-sm/6">
            While your cell phone screen can display about three million pixels of information and your eye can receive more than ten million pixels, NASA images from space are even bigger! NASA’s space missions continue to push the boundaries of what is technologically possible, providing high-resolution images and videos of Earth, other planets, and space with billions or even trillions of pixels. Your challenge is to create a platform that allows users to zoom in and out on these massive image datasets, label known features, and discover new patterns.
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.spaceappschallenge.org/2025/find-a-team/solaria4/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Team Solaria
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.spaceappschallenge.org/2025/challenges/embiggen-your-eyes/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          See full challenge description →
        </a>
      </footer>
    </div>
  );
}
