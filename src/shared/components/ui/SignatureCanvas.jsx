import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 240;
const MIN_STROKE_DISTANCE = 2;

function getPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  };
}

export function SignatureCanvas({
  value = "",
  onChange,
  disabled = false,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
}) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const hasStrokeRef = useRef(Boolean(value));
  const currentStrokeHasMovementRef = useRef(false);
  const lastPointRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(Boolean(value));

  const fillWhite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.save();
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    fillWhite();
  }, [width, height]);

  useEffect(() => {
    if (!value) {
      hasStrokeRef.current = false;
      setHasSignature(false);
      fillWhite();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = new Image();
    image.onload = () => {
      fillWhite();
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      hasStrokeRef.current = true;
      setHasSignature(true);
    };
    image.src = value;
  }, [value]);

  const startDrawing = (event) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    isDrawingRef.current = true;
    currentStrokeHasMovementRef.current = false;
    lastPointRef.current = getPoint(event, canvas);
  };

  const draw = (event) => {
    if (disabled || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const lastPoint = lastPointRef.current;
    if (!canvas || !lastPoint) return;

    event.preventDefault();
    const nextPoint = getPoint(event, canvas);
    const distance = Math.hypot(
      nextPoint.x - lastPoint.x,
      nextPoint.y - lastPoint.y
    );

    if (distance < MIN_STROKE_DISTANCE) {
      return;
    }

    const context = canvas.getContext("2d");
    context.strokeStyle = "#0f172a";
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(nextPoint.x, nextPoint.y);
    context.stroke();
    hasStrokeRef.current = true;
    currentStrokeHasMovementRef.current = true;
    lastPointRef.current = nextPoint;
  };

  const stopDrawing = (event) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    canvas?.releasePointerCapture?.(event.pointerId);

    if (canvas && currentStrokeHasMovementRef.current) {
      setHasSignature(true);
      onChange?.(canvas.toDataURL("image/png"));
    }
    currentStrokeHasMovementRef.current = false;
  };

  const clearSignature = () => {
    fillWhite();
    isDrawingRef.current = false;
    hasStrokeRef.current = false;
    currentStrokeHasMovementRef.current = false;
    lastPointRef.current = null;
    setHasSignature(false);
    onChange?.("");
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
        {!hasSignature && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-medium text-slate-400">
            Vui lòng ký tên vào ô bên dưới
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`block w-full touch-none bg-white ${
            disabled ? "cursor-not-allowed opacity-70" : "cursor-crosshair"
          }`}
          style={{ aspectRatio: `${width} / ${height}` }}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
          aria-label="Ô ký xác nhận"
        />
      </div>

      <button
        type="button"
        onClick={clearSignature}
        disabled={disabled || !hasSignature}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw size={16} />
        Xóa chữ ký
      </button>
    </div>
  );
}

export default SignatureCanvas;
