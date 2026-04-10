import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
} from "lucide-react";
import { chatAPI } from "../../api/chat.api";

function isImageAttachment(attachment) {
  return String(attachment?.mimetype || "").startsWith("image/");
}

function isVideoAttachment(attachment) {
  return String(attachment?.mimetype || "").startsWith("video/");
}

function getAttachmentName(attachment) {
  return (
    attachment?.originalName ||
    attachment?.filename ||
    attachment?.name ||
    "Tệp đính kèm"
  );
}

function formatTime(seconds = 0) {
  const safe = Math.max(0, Number(seconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function AttachmentPreviewModal({ attachment, onClose }) {
  const videoRef = useRef(null);
  const modalRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const isImage = isImageAttachment(attachment);
  const isVideo = isVideoAttachment(attachment);
  const fileName = getAttachmentName(attachment);
  const fileUrl = chatAPI.getAttachmentUrl(attachment);

  const progressPercent = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  useEffect(() => {
    setIsPlaying(false);
    setIsMuted(false);
    setDuration(0);
    setCurrentTime(0);
  }, [attachment]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setCurrentTime(video.currentTime || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isVideo, fileUrl]);

  const handleTogglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
      setIsPlaying(true);
      return;
    }

    video.pause();
    setIsPlaying(false);
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (event) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const nextTime = Number(event.target.value || 0);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await video.requestFullscreen?.();
  };

  if (!attachment) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
        onClick={onClose}
        aria-label="Đóng preview"
      />

      <div
        ref={modalRef}
        className="relative z-[101] flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-slate-900">
              {fileName}
            </div>
            <div className="text-xs text-slate-500">
              {attachment?.mimetype || "attachment"}
            </div>
          </div>

          <div className="ml-4 flex items-center gap-2">
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Tải xuống
              </a>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
          {isImage && fileUrl ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-lg"
            />
          ) : isVideo && fileUrl ? (
            <div className="w-full max-w-4xl">
              <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="group relative block w-full text-left"
                >
                  <video
                    ref={videoRef}
                    src={fileUrl}
                    className="max-h-[70vh] w-full bg-black object-contain"
                    playsInline
                    preload="metadata"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-100 transition-opacity group-hover:opacity-100" />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    {!isPlaying ? (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg">
                        <Play className="ml-1 h-7 w-7" />
                      </div>
                    ) : null}
                  </div>
                </button>

                <div className="border-t border-white/10 bg-black px-4 py-3 text-white">
                  <div className="mb-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20"
                    />
                    <div
                      className="pointer-events-none -mt-1.5 h-1.5 rounded-full bg-amber-400"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTogglePlay}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="ml-0.5 h-5 w-5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>

                      <div className="text-sm font-medium text-white/85">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
                        title="Tải xuống"
                      >
                        <Download className="h-5 w-5" />
                      </a>

                      <button
                        type="button"
                        onClick={handleFullscreen}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
                        title="Toàn màn hình"
                      >
                        <Maximize2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
              <div className="text-base font-bold text-slate-900">{fileName}</div>
              <div className="mt-2 text-sm text-slate-500">
                Không thể xem trước trực tiếp loại tệp này.
              </div>

              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
                >
                  <Download className="h-4 w-4" />
                  Tải xuống
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}