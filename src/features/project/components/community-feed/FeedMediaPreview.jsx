import { isProjectFeedVideoMedia } from "./utils/projectFeed.utils";

export function FeedMediaPreview({ media }) {
  if (!media?.url) return null;

  if (isProjectFeedVideoMedia(media)) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100">
        <video className="h-full w-full object-cover" src={media.url} controls />
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100">
      <img
        alt="post media"
        className="h-full w-full object-cover"
        src={media.url}
        onError={(event) => {
          event.currentTarget.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";
        }}
      />
    </div>
  );
}

export default FeedMediaPreview;