import { type ReactNode } from 'react';

interface FlowbiteVideoProps {
  src?: string;
  poster?: string;
  title?: string;
  caption?: ReactNode;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

export function FlowbiteVideo({
  src,
  poster,
  title,
  caption,
  autoPlay = false,
  loop = false,
  muted = true,
  controls = true,
  className = '',
}: FlowbiteVideoProps) {
  return (
    <figure className={`w-full overflow-hidden border border-border bg-bg rounded-md space-y-2 ${className}`}>
      <div className="relative aspect-video w-full bg-surface-3 flex items-center justify-center">
        {src ? (
          <video
            src={src}
            poster={poster}
            title={title}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border border-border bg-surface-2 flex items-center justify-center text-pink font-mono text-xl">
              ▶
            </div>
            <p className="font-mono text-xs text-text-faint uppercase tracking-wider">
              {title ?? 'Video Stream Offline'}
            </p>
          </div>
        )}
      </div>

      {caption && (
        <figcaption className="p-3 text-xs font-mono text-text-muted border-t border-hairline bg-surface-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
