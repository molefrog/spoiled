import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";

import { Spoiler } from "../src/index";
import { GIFMaker } from "./GIFFallbackMaker";

import "./demo.css";

// fallback images for light/dark themes
import fallbackLightImg from "../src/assets/fallback-light.webp";

const SpoilerWithFallback = (props) => {
  return (
    <span
      style={{
        background: `repeat top left / 16px 16px url(${fallbackLightImg})`,
        color: "transparent",
      }}
    >
      {props.children}
    </span>
  );
};

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
    <main className="mx-auto max-w-[420px] px-2 py-32">
      {false && <GIFMaker />}

      <header className="mb-12 text-center">
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

      <div className="prose">
        <div className="my-6 rounded-2xl bg-zinc-50 px-5 py-4">
          <div className="mb-5 text-center">
            Inspired by the{" "}
            <a
              href="https://telegram.org/blog/reactions-spoilers-translations#spoilers"
              target="_blank"
            >
              spoiler markup in Telegram messenger
            </a>
            , spoiled displays an animated cloud of particles over content that should stay
            confidential (until revealed).
          </div>

          <div className="flex justify-center">
            <a
              href="https://github.com/molefrog/spoiled"
              className="f w-full rounded-lg border-4 border-transparent bg-zinc-800 px-4 py-2 text-center font-medium text-zinc-50 hover:border-blue-500 hover:bg-zinc-900"
            >
              Install & Docs →
            </a>
          </div>
        </div>

        {/** features */}
        <div className="my-6 rounded-2xl bg-zinc-50 px-5 py-4 text-base">
          <div className="border-b border-neutral-200 py-3 first:pt-0 last:border-b-0 last:pb-0">
            Uses{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API">
              CSS Painting API
            </a>{" "}
            for realistic rendering of inline elements. Comes with a fallback
          </div>

          <div className="border-b border-neutral-200 py-3 first:pt-0 last:border-b-0 last:pb-0">
            Accessible, supports{" "}
            <a href="https://github.com/molefrog/spoiled?tab=readme-ov-file#theming">
              light/dark/system
            </a>{" "}
            mode
          </div>

          <div className="border-b border-neutral-200 py-3 first:pt-0 last:border-b-0 last:pb-0">
            Customizable FPS, density, color, noise animation, content transitions and more
          </div>

          <div className="border-b border-neutral-200 py-3 first:pt-0 last:border-b-0 last:pb-0">
            Comes in{" "}
            <a href="https://github.com/molefrog/spoiled?tab=readme-ov-file#styling">
              styled or unstyled
            </a>{" "}
            variants
          </div>
        </div>

        <div className="my-6 rounded-2xl bg-zinc-50 px-5 py-2">
          <h4 className="font-semibold text-indigo-600">⌘ It&apos;s easy to use</h4>
          <p>Install the package via npm:</p>

          <pre>npm i spoiled</pre>

          <p>
            Now, wrap your text in a spoiler, so{" "}
            <Spoiler density={0.2} theme={colorTheme}>
              the plot twists stay hidden
            </Spoiler>
          </p>

          <pre>{`import { Spoiler } from "spoiled";

// Reveals on hover
<Spoiler>
  Hogwarts is a startup incubator
</Spoiler>`}</pre>

          <p>
            By default, the spoiler is uncontrolled and will reveal on hover. See how this behaviour{" "}
            <a href="https://github.com/molefrog/spoiled?tab=readme-ov-file#hiding-and-revealing-the-spoiler">
              can be customised.
            </a>
          </p>
        </div>

        <div className="my-6 rounded-2xl bg-zinc-50 px-5 py-2 text-sm text-neutral-600">
          As of 2024, CSS Houdini API is supported by the 70% of the browsers. We do have a fallback
          though, so here is what it will look like in Safari.{" "}
          <SpoilerWithFallback>
            We use a tiny static image pattern as a fallback
          </SpoilerWithFallback>
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
