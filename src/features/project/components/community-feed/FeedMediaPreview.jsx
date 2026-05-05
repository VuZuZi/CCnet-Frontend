import { useEffect, useState } from "react";
import { isProjectFeedVideoMedia } from "./utils/projectFeed.utils";

export function FeedMediaPreview({ media }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [media?.url]);

  if (!media?.url) return null;

  if (isProjectFeedVideoMedia(media)) {
    if (hasError) {
      return (
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm text-slate-500 border border-slate-200">
          Không tải được video
        </div>
      );
    }

    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
        <video
          className="h-full w-full object-cover"
          src={media.url}
          controls
          preload="metadata"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
      <img
        alt="Ảnh bài viết"
        className="h-full w-full object-cover"
        src={media.url}
        onError={(event) => {
          event.currentTarget.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EKh%C3%B4ng%20t%E1%BA%A3i%20%C4%91%C6%B0%E1%BB%A3c%20%E1%BA%A3nh%3C/text%3E%3C/svg%3E";
        }}
      />
    </div>
  );
}

export default FeedMediaPreview;
