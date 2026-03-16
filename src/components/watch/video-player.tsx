"use client";

import { useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  src: string;
  subtitles?: Array<{
    lang: string;
    url: string;
    default?: boolean;
  }>;
  poster?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  startTime?: number;
}

export function VideoPlayer({
  src,
  subtitles,
  poster,
  onTimeUpdate,
  startTime,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    destroyHls();

    if (src.includes(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (startTime && startTime > 0) {
          video.currentTime = startTime;
        }
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              destroyHls();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        if (startTime && startTime > 0) {
          video.currentTime = startTime;
        }
        video.play().catch(() => {});
      });
    } else {
      video.src = src;
    }

    return () => {
      destroyHls();
    };
  }, [src, startTime, destroyHls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onTimeUpdate) return;

    const handler = () => {
      onTimeUpdate(video.currentTime, video.duration);
    };

    video.addEventListener("timeupdate", handler);
    return () => video.removeEventListener("timeupdate", handler);
  }, [onTimeUpdate]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        className="aspect-video w-full"
        controls
        playsInline
        poster={poster}
      >
        {subtitles?.map((sub, index) => (
          <track
            key={`${sub.lang}-${index}`}
            kind="subtitles"
            label={sub.lang}
            src={sub.url}
            srcLang={sub.lang.toLowerCase().slice(0, 2)}
            default={sub.default}
          />
        ))}
      </video>
    </div>
  );
}
