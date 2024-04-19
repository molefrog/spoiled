import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";

import { Spoiler } from "../src/index";
import { GIFMaker } from "./GIFFallbackMaker";

import "./demo.css";

const App = () => {
  const [timeBased, setTimeBased] = useState(false);
  const colorTheme = "light";

  useEffect(() => {
    const int = setInterval(() => {
      setTimeBased((prev) => !prev);
    }, 2500);

    return () => {
      clearInterval(int);
    };
  });

  return (
    <main className="mx-auto max-w-[420px] px-2 pt-32">
      {false && <GIFMaker />}

      <header className="text-center">
        <h1 className="mb-2 text-lg font-semibold">spoiled</h1>
        <h2 className="text-lg sm:px-10">
          <Spoiler
            hidden={!timeBased}
            noiseFadeDuration={2}
            density={0.2}
            className="header-text"
            theme={colorTheme}
            aria-label="Spoiler component for React"
          >
            Hide your precious secrets. Realistic{" "}
            <code className="rounded bg-stone-100 px-0.5 py-0.5 text-base tracking-tight">
              {"<Spoiler />"}
            </code>{" "}
            component for React, powered by CSS Houdini
          </Spoiler>
        </h2>
      </header>

      <div className="prose-sm">
        <div className="my-12 rounded-2xl bg-zinc-50 px-5 py-4">
          <div className="mb-5 text-center">
            Inspired by the{" "}
            <a
              href="https://telegram.org/blog/reactions-spoilers-translations#spoilers"
              target="_blank"
              className="text-slate-700 underline decoration-slate-300 hover:text-blue-600 hover:decoration-blue-500"
            >
              spoiler markup in Telegram messenger
            </a>
            , spoiled displays an animated cloud of particles over content that should stay
            confidential (until revealed).
          </div>

          <div className="flex justify-center">
            <a
              href="https://github.com/molefrog/spoiled"
              className="f rounded-lg border-4 border-transparent bg-zinc-800 px-4 py-2 font-medium text-zinc-50 hover:border-blue-500 hover:bg-zinc-900"
            >
              Install & Docs →
            </a>
          </div>
        </div>

        <div>
          <h3>It&apos;s easy to use</h3>
          <p>Install the package via npm:</p>

          <code>
            <pre>npm i spoiled</pre>
          </code>

          <p>Wrap your text in a spoiler, so the plot twists stay hidden:</p>
          <code>
            <pre>{`import { Spoiler } from "spoiled";

// Reveals on hover
<Spoiler>
  Hogwarts is a high-tech <b>startup incubator</b>
</Spoiler>`}</pre>
          </code>
        </div>
      </div>
    </main>
  );
};

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
