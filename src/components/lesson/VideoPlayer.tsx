"use client"

import { extractYouTubeId } from "@/lib/utils"

interface VideoPlayerProps {
  youtubeUrl: string
  title: string
}

export function VideoPlayer({ youtubeUrl, title }: VideoPlayerProps) {
  const videoId = extractYouTubeId(youtubeUrl)

  if (!videoId) {
    return (
      <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
        動画を読み込めません
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
