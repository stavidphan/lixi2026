import { useRef, useEffect, useState, useCallback } from 'react';
import './ScratchCard.css';

interface ScratchCardProps {
  width: number;
  height: number;
  onReveal: () => void;
  revealThreshold?: number;
  children: React.ReactNode;
}

export default function ScratchCard({
  width,
  height,
  onReveal,
  revealThreshold = 0.45,
  children,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const revealedRef = useRef(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#c9a94e');
    gradient.addColorStop(0.3, '#f0d878');
    gradient.addColorStop(0.5, '#c9a94e');
    gradient.addColorStop(0.7, '#f0d878');
    gradient.addColorStop(1, '#c9a94e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        if (Math.random() > 0.5) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    ctx.font = 'bold 16px "Noto Sans", sans-serif';
    ctx.fillStyle = 'rgba(139, 0, 0, 0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CÀO TẠI ĐÂY', width / 2, height / 2);
  }, [width, height]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPos = (e: React.TouchEvent | React.MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return null;
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();

    if (lastPosRef.current) {
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 40;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    lastPosRef.current = { x, y };
  };

  const checkReveal = useCallback(() => {
    if (revealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    let sampled = 0;

    const step = 16;
    for (let i = 3; i < pixels.length; i += 4 * step) {
      sampled++;
      if (pixels[i] === 0) transparent++;
    }

    if (sampled > 0 && transparent / sampled >= revealThreshold) {
      revealedRef.current = true;
      setRevealed(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onReveal();
    }
  }, [onReveal, revealThreshold]);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (revealed) return;
    e.preventDefault();
    setIsScratching(true);
    const pos = getPos(e);
    if (pos) {
      lastPosRef.current = pos;
      scratch(pos.x, pos.y);
    }
  };

  const scratchCountRef = useRef(0);

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isScratching || revealed) return;
    e.preventDefault();
    const pos = getPos(e);
    if (pos) {
      scratch(pos.x, pos.y);
      scratchCountRef.current++;
      if (scratchCountRef.current % 10 === 0) {
        checkReveal();
      }
    }
  };

  const handleEnd = () => {
    if (revealed) return;
    setIsScratching(false);
    lastPosRef.current = null;
    checkReveal();
  };

  return (
    <div className="scratch-card-container" style={{ width, height }}>
      <div className="scratch-card-content">{children}</div>
      <canvas
        ref={canvasRef}
        className={`scratch-card-canvas ${revealed ? 'revealed' : ''}`}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
      />
    </div>
  );
}
