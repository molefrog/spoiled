import * as React from "react";
import { useRef } from "react";

import { SpoilerPainterWorklet } from "../src/worklet";
import GIF from "gif.js/dist/gif";

// @ts-ignore
import GIF_JSWorkerPath from "gif.js/dist/gif.worker.js?url";

const GIF_SIZE = 82;

export const GIFMaker = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const createPlaceholderGIF = () => {
    var gif = new GIF({
      workerScript: GIF_JSWorkerPath,
      workers: 1,
      quality: 10,
      width: GIF_SIZE,
      height: GIF_SIZE,
      transparent: "#ffffff",
    });

    const canvasElement = canvasRef.current!;

    const props = new Map<string, string>([
      ["--t", "0.0"],
      ["--fade", "0.0"],
      ["--accent", "0deg 0% 35%"],
      // ["--density", "0.12"],
    ]);

    const ctx = canvasElement.getContext("2d");

    const total = 1512; // 72ms each frame ~ 13 fps
    const delay = 2 * 3 * 2 * 2 * 3;

    const worklet = new SpoilerPainterWorklet();

    for (let i = 0; i < total / delay; i++) {
      const t = (i * delay) / 1000.0;
      props.set("--t", t.toFixed(3));

      worklet.paint(ctx, { width: GIF_SIZE, height: GIF_SIZE }, props);
      gif.addFrame(ctx, { copy: true, delay: delay / 1.5 });
    }

    gif.on("finished", function (blob) {
      resultRef.current!.style.setProperty("--gif", `url(${URL.createObjectURL(blob)})`);
      resultRef.current!.style.setProperty("--w", `${GIF_SIZE / 2}px`);

      // window.open(URL.createObjectURL(blob));
    });

    gif.render();
  };

  return (
    <div className="placeholder">
      <canvas ref={canvasRef} width={GIF_SIZE} height={GIF_SIZE}></canvas>

      <div className="result" ref={resultRef}></div>
      <button onClick={() => createPlaceholderGIF()}>Render GIF</button>
    </div>
  );
};
