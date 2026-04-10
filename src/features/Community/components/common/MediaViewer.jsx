import React, { useState, useEffect } from "react";

const MediaViewer = ({ images, initialIndex = 0 }) => {
  // 1. Khởi tạo state với initialIndex
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Cập nhật currentIndex nếu initialIndex thay đổi (ví dụ: khi mở modal với ảnh khác)
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!images || images.length === 0) return null;

  const currentMedia = images[currentIndex];

  // Logic chuyển ảnh
  const handleNext = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài làm đóng modal
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative p-2 md:p-6">
      {/* 2. MŨI TÊN BÊN TRÁI (Previous) */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-3 bg-gray-900/60 hover:bg-gray-800/80 rounded-full text-white transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-3xl">
            chevron_left
          </span>
        </button>
      )}

      {/* Hiển thị Media chính */}
      <div className="max-w-full max-h-full flex items-center justify-center overflow-hidden">
        {currentMedia.type === "video" ? (
          <video
            src={currentMedia.url}
            controls
            autoPlay
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded"
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={`Post media ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded"
          />
        )}
      </div>

      {/* 3. MŨI TÊN BÊN PHẢI (Next) */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-3 bg-gray-900/60 hover:bg-gray-800/80 rounded-full text-white transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-3xl">
            chevron_right
          </span>
        </button>
      )}

      {/* Bộ đếm ảnh (ví dụ: 2/5) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[60] py-1 px-3 bg-gray-900/70 rounded-full text-white text-xs font-semibold">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default MediaViewer;
