import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "./SignatureCanvas.css";

export interface SignatureCanvasRef {
  clear: () => void;
  isEmpty: () => boolean;
  exportAsBase64: () => string | null;
}

interface SignatureCanvasProps {
  disabled?: boolean;
}

interface Point {
  x: number;
  y: number;
}

const STROKE_WIDTH = 2.4;

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  function SignatureCanvas({ disabled = false }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<Point | null>(null);
    const hasDrawnRef = useRef(false);

    const [hasDrawnState, setHasDrawnState] = useState(false);

    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;

      if (!canvas || !wrapper) {
        return;
      }

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const rect = wrapper.getBoundingClientRect();

      const cssWidth = Math.floor(rect.width);
      const cssHeight = 220;

      const previousDataUrl =
        hasDrawnRef.current && canvas.width > 0 && canvas.height > 0
          ? canvas.toDataURL("image/png")
          : null;

      canvas.width = Math.floor(cssWidth * ratio);
      canvas.height = Math.floor(cssHeight * ratio);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(ratio, ratio);
      context.clearRect(0, 0, cssWidth, cssHeight);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, cssWidth, cssHeight);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#111827";
      context.lineWidth = STROKE_WIDTH;

      if (previousDataUrl) {
        const image = new Image();
        image.onload = () => {
          context.drawImage(image, 0, 0, cssWidth, cssHeight);
        };
        image.src = previousDataUrl;
      }
    }, []);

    useEffect(() => {
      resizeCanvas();

      const handleResize = () => {
        resizeCanvas();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [resizeCanvas]);

    const getCoordinates = useCallback(
      (event: PointerEvent | React.PointerEvent<HTMLCanvasElement>): Point | null => {
        const canvas = canvasRef.current;

        if (!canvas) {
          return null;
        }

        const rect = canvas.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) {
          return null;
        }

        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      },
      [],
    );

    const drawLine = useCallback((from: Point, to: Point) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!canvas || !context) {
        return;
      }

      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }, []);

    const startDrawing = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (disabled) {
          return;
        }

        const point = getCoordinates(event);

        if (!point) {
          return;
        }

        isDrawingRef.current = true;
        lastPointRef.current = point;

        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (context) {
          context.beginPath();
          context.arc(point.x, point.y, STROKE_WIDTH / 2, 0, Math.PI * 2);
          context.fillStyle = "#111827";
          context.fill();
        }

        hasDrawnRef.current = true;
        setHasDrawnState(true);

        event.currentTarget.setPointerCapture(event.pointerId);
      },
      [disabled, getCoordinates],
    );

    const moveDrawing = useCallback(
      (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (disabled || !isDrawingRef.current) {
          return;
        }

        const point = getCoordinates(event);
        const previousPoint = lastPointRef.current;

        if (!point || !previousPoint) {
          return;
        }

        drawLine(previousPoint, point);
        lastPointRef.current = point;
        hasDrawnRef.current = true;
        setHasDrawnState(true);
      },
      [disabled, drawLine, getCoordinates],
    );

    const stopDrawing = useCallback(() => {
      isDrawingRef.current = false;
      lastPointRef.current = null;
    }, []);

    const clear = useCallback(() => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();

      if (!context) {
        return;
      }

      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, rect.width, rect.height);

      hasDrawnRef.current = false;
      setHasDrawnState(false);
      isDrawingRef.current = false;
      lastPointRef.current = null;
    }, []);

    const isEmpty = useCallback(() => {
      return !hasDrawnRef.current;
    }, []);

    const exportAsBase64 = useCallback(() => {
      const canvas = canvasRef.current;

      if (!canvas || !hasDrawnRef.current) {
        return null;
      }

      return canvas.toDataURL("image/png");
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        clear,
        isEmpty,
        exportAsBase64,
      }),
      [clear, exportAsBase64, isEmpty],
    );

    return (
      <div className="signature-canvas" ref={wrapperRef}>
        <canvas
          ref={canvasRef}
          className={`signature-canvas__surface${
            disabled ? " signature-canvas__surface--disabled" : ""
          }`}
          onPointerDown={startDrawing}
          onPointerMove={moveDrawing}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
        />

        <div className="signature-canvas__footer">
          <p className="signature-canvas__hint">
            Signe au doigt, au stylet ou à la souris.
          </p>

          <button
            type="button"
            className="signature-canvas__clear-button"
            onClick={clear}
            disabled={disabled || !hasDrawnState}
          >
            Effacer
          </button>
        </div>
      </div>
    );
  },
);

export default SignatureCanvas;