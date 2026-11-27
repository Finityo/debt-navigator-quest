import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Play, Square } from 'lucide-react';
import type { SectionInfo } from './sectionInfo';

/**
 * The section-card explanation pattern from the Budget Planner:
 * a one-line label on the card, a Play button that plays the
 * recorded voice explanation (recorded voice, not device
 * text-to-speech), and a Read button that opens the full written
 * text in a popup for hearing-impaired users.
 */
export default function SectionExplain({ info }: { info: SectionInfo }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [readOpen, setReadOpen] = useState(false);

  const stop = () => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setPlaying(false);
  };

  // Stop the recording when the card unmounts.
  useEffect(() => stop, []);

  const togglePlay = () => {
    if (playing) {
      stop();
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    const a = audioRef.current;
    a.src = info.audio;
    a.currentTime = 0;
    a.onended = () => setPlaying(false);
    const p = a.play();
    if (p) p.then(() => setPlaying(true)).catch(() => setPlaying(false));
    else setPlaying(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <p className="text-sm text-muted-foreground flex-1 min-w-[12rem]">{info.label}</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={togglePlay}
          aria-label={`Play the voice explanation for ${info.title}`}
        >
          {playing ? (
            <Square className="w-3.5 h-3.5 mr-1.5" />
          ) : (
            <Play className="w-3.5 h-3.5 mr-1.5" />
          )}
          {playing ? 'Stop' : 'Play explanation'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={() => setReadOpen(true)}
        >
          Read explanation
        </Button>
      </div>

      <Dialog open={readOpen} onOpenChange={setReadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{info.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="leading-relaxed">{info.text}</DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
