import React, { useState } from "react";

const MediaViewer = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentImg = images?.[currentIndex]?.url;

  const nextImage = (e) => {
    e.stopPropagation();
    if (images?.length > 1) {
      setIsLoading(true);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  return (
    <section className="relative w-full md:w-[60%] bg-black flex items-center justify-center group select-none">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all z-20 hover:scale-110"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 18L18 6M6 6l12 12"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {currentImg ? (
        <img
          src={currentImg}
          alt="Post Content"
          className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
        />
      ) : (
        <div className="text-gray-600">No media available</div>
      )}

      {images?.length > 1 && (
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all z-10 opacity-0 group-hover:opacity-100"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 5l7 7-7 7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {images?.length > 1 && (
        <div className="absolute bottom-4 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === currentIndex ? "bg-yellow-500" : "bg-white/30"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MediaViewer;
