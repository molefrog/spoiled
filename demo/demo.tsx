import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";

import { Spoiler } from "../src/index";
import { GIFMaker } from "./GIFFallbackMaker";
import { highlight } from "sugar-high";

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

const MessageBubble = ({ children, className }) => {
  return (
    <div
      className={`${className} my-5 rounded-2xl border border-neutral-200 bg-white px-4 py-5 shadow-lg sm:my-8 sm:px-6 sm:shadow-2xl dark:shadow-slate-800`}
    >
      {children}
    </div>
  );
};

const CodeHighlight = ({ children, ...rest }) => {
  return <pre {...rest} dangerouslySetInnerHTML={{ __html: highlight(children) }}></pre>;
};

const App = () => {
  const [timeBased, setTimeBased] = useState(false);

  useEffect(() => {
    const int = setInterval(() => {
      setTimeBased((prev) => !prev);
    }, 2000);

    return () => {
      clearInterval(int);
    };
  });

  return (
    <main className="mx-auto max-w-[420px] px-2 py-32">
      {false && <GIFMaker />}

      <header className="mb-14 text-center">
        <h1 className="mb-2 text-lg font-semibold dark:text-slate-100">spoiled</h1>
        <h2 className="text-xl sm:px-8 dark:text-slate-100">
          <Spoiler
            hidden={!timeBased}
            noiseFadeDuration={2}
            density={0.2}
            className="header-text"
            aria-label="Spoiler component for React"
          >
            Hide your precious secrets. Realistic{" "}
            <code className="rounded bg-stone-100 px-0.5 py-0.5 text-base tracking-tight text-slate-900">
              {"<Spoiler />"}
            </code>{" "}
            component for React, powered by CSS Houdini
          </Spoiler>
        </h2>
      </header>

      <div>
        {/** CTA */}
        <MessageBubble>
          <div className="prose mb-5 text-center text-base/6">
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
        </MessageBubble>

        {/** features */}
        <MessageBubble className="prose text-base/6">
          <div className="border-b border-neutral-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
            Uses{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API">
              CSS Painting API
            </a>{" "}
            for realistic rendering of inline elements. Comes with a fallback
          </div>

          <div className="border-b border-neutral-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
            Accessible, supports{" "}
            <a href="https://github.com/molefrog/spoiled?tab=readme-ov-file#theming">
              light/dark/system
            </a>{" "}
            mode
          </div>

          <div className="border-b border-neutral-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
            Customizable FPS, density, color, noise animation, content transitions and more
          </div>

          <div className="border-b border-neutral-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
            Comes in{" "}
            <a href="https://github.com/molefrog/spoiled?tab=readme-ov-file#styling">
              styled or unstyled
            </a>{" "}
            variants
          </div>
        </MessageBubble>

        {/** quick start */}
        <MessageBubble className="prose text-base/6">
          <h4 className="mb-2 font-semibold">⌘ It&apos;s easy to use</h4>
          <p>Install the package via npm:</p>

          <pre className="bg-gray-50 text-gray-900 shadow-inner">npm i spoiled</pre>

          <p>
            Now, wrap your text in a spoiler, so that{" "}
            <Spoiler density={0.2} theme={"light"}>
              all essential plot twists and suprises remain hidden
            </Spoiler>
          </p>

          <CodeHighlight className="bg-gray-50 text-gray-900 shadow-inner">{`import { Spoiler } from "spoiled";

// Reveals on hover
<Spoiler>
  Hogwarts is a startup incubator
</Spoiler>`}</CodeHighlight>

          <p>
            By default, the spoiler is uncontrolled and will reveal on hover. See how this behaviour{" "}
            <a href="https://github.com/molefrog/spoiled?tab=readme-ov-file#hiding-and-revealing-the-spoiler">
              can be customised.
            </a>
          </p>
        </MessageBubble>

        {/** block elements */}
        <MessageBubble className="prose text-base/6">
          <h4 className="mb-2 font-semibold">⌘ Works with block elements too</h4>

          <Spoiler fps={20} tagName="div" className="not-pros" theme="light">
            <img
              className="w-full"
              alt="Silly cat playing a piano"
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmZvMDduYWZrcng2eWNyN2F2bnFvdTludXVnb3kxbm5uenBxMGRkdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vFtWp05vBYnMQ/giphy.gif"
            ></img>
          </Spoiler>
          <p>
            By default, spoiler wraps your content in a <code>{`<span />`}</code>, but you can use{" "}
            <a href="https://github.com/molefrog/spoiled?tab=readme-ov-file#how-to-use">
              <code>{`tagName`}</code> prop
            </a>
            , to customise the wrapper to hide block elements.
          </p>
        </MessageBubble>

        <div className="rounded-2xl px-6 py-2 text-sm/5 text-neutral-500 dark:text-neutral-400">
          As of 2024, CSS Houdini API is supported by the 70% of the browsers. We do have a fallback
          though, so here is what it will look like in Safari.{" "}
          <SpoilerWithFallback>
            We use a tiny static image pattern as a fallback
          </SpoilerWithFallback>
        </div>
      </div>

      <div className="bottom-4 pt-14 text-center text-xs sm:fixed sm:right-6 sm:max-w-60 sm:text-right">
        <div className="text-sm dark:text-neutral-300">
          made by{" "}
          <a href="https://molefrog.com" className="font-semibold">
            @molefrog
          </a>
        </div>

        <div className="text-balance text-xs text-neutral-500 dark:text-neutral-500">
          we don't guarantee that the secrets will stay hidden, use at your own risk
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
