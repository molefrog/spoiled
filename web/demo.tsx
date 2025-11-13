import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { highlight } from "sugar-high";
import GitHubButton from "react-github-btn";

import { Spoiler } from "../src/index";
import { GIFMaker } from "./GIFFallbackMaker";

import "./demo.css";

const MessageBubble = ({ children, className }: React.ComponentProps<"div">) => {
  return (
    <div
      className={`${className} shadow-elevation-medium my-4 rounded-2xl bg-white px-4 py-5 sm:my-6 sm:px-6`}
    >
      {children}
    </div>
  );
};

const WavingHandIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      {...props}
    >
      <path
        d="M11.9005 5.70103C12.1743 4.96757 11.7865 4.15657 11.0342 3.88961C10.2819 3.62265 9.4501 4.00083 9.1763 4.73429L6.5443 11.7848L5.60953 9.82225C5.19966 8.96175 4.11475 8.64198 3.28412 9.13687C2.64855 9.51553 2.35476 10.266 2.56985 10.9613L3.96974 15.4867C4.28743 16.5137 4.44628 17.0272 4.70166 17.4731C5.09127 18.1534 5.64795 18.7281 6.32165 19.1455C6.76324 19.4191 7.27913 19.6022 8.31092 19.9683C10.2783 20.6665 11.262 21.0156 12.1549 20.9995C13.5203 20.9748 14.812 20.3851 15.709 19.377C16.2956 18.7177 16.6547 17.7556 17.373 15.8314L19.4122 10.372C19.686 9.63852 19.2981 8.82752 18.5458 8.56056C17.7936 8.2936 16.9618 8.67178 16.688 9.40524M11.9005 5.70103L12.5616 3.93029C12.8354 3.19683 13.6672 2.81866 14.4194 3.08562C15.1717 3.35257 15.5596 4.16357 15.2858 4.89704L14.6248 6.66777M11.9005 5.70103L10.4132 9.68518M14.6248 6.66777C14.8986 5.93431 15.7304 5.55613 16.4826 5.82309C17.2349 6.09005 17.6228 6.90105 17.349 7.63451L16.688 9.40524M14.6248 6.66777L13.1374 10.6519M16.688 9.40524L15.8617 11.6187"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.3307 14C21.877 15.6354 21.0574 17.4263 19.5 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
    <>
      <div className="group absolute right-2 top-4 z-50 block p-1 sm:fixed sm:right-5">
        <GitHubButton
          href="https://github.com/molefrog/spoiled"
          data-color-scheme="no-preference: light; light: light; dark: dark;"
          data-size="large"
          data-text="Star"
          data-show-count="true"
          aria-label="Star molefrog/spoiled on GitHub"
        >
          Star
        </GitHubButton>
      </div>

      <main className="mx-auto max-w-[420px] px-2 py-32">
        {false && <GIFMaker />}

        <header className="mb-14 text-center">
          <div className="masked-logo aspect-2/1 relative mx-auto mb-4 max-w-64">
            <div className="bg-linear-to-b absolute inset-0 from-gray-900 via-gray-900 to-slate-800 dark:from-gray-100 dark:via-gray-100 dark:to-slate-400" />
          </div>

          <h2 className="text-2xl font-medium tracking-tight  dark:text-slate-100">
            <Spoiler
              hidden={!timeBased}
              noiseFadeDuration={2}
              density={0.2}
              className="header-text"
              aria-label="Spoiler component for React"
            >
              Hide your precious secrets. Realistic{" "}
              <code className="roundedpx-0.5 py-0.5 text-base tracking-tight">{"<Spoiler />"}</code>{" "}
              component for React, powered by CSS Houdini
            </Spoiler>
          </h2>
        </header>

        <div className="pt-2">
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
                className="f w-full rounded-xl border-4 border-transparent bg-zinc-800 px-4 py-2 text-center font-medium text-zinc-50 hover:border-blue-500 hover:bg-zinc-900"
              >
                GitHub & Docs →
              </a>
            </div>
          </MessageBubble>

          {/** features */}
          <MessageBubble className="prose divide-y divide-neutral-200 text-base/6">
            <div className="py-4 first:pt-0 last:pb-0">
              Uses{" "}
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API">
                CSS Painting API
              </a>{" "}
              for realistic rendering of inline elements. Comes with a fallback
            </div>

            <div className="py-4 first:pt-0 last:pb-0">
              Accessible, supports{" "}
              <a href="https://github.com/molefrog/spoiled?tab=readme-ov-file#theming">
                light/dark/system
              </a>{" "}
              mode
            </div>

            <div className="py-4 first:pt-0 last:pb-0">
              Customizable FPS, density, color, noise animation, content transitions and more
            </div>

            <div className="py-4 first:pt-0 last:pb-0">
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
              By default, the spoiler is uncontrolled and will reveal on hover. See how this
              behaviour{" "}
              <a href="https://github.com/molefrog/spoiled?tab=readme-ov-file#hiding-and-revealing-the-spoiler">
                can be customised.
              </a>
            </p>
          </MessageBubble>

          {/** block elements */}
          <MessageBubble className="prose text-base/6">
            <h4 className="mb-2 font-semibold">⌘ Hide block elements under a spoiler</h4>

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

            <CodeHighlight className="bg-gray-50 text-gray-900 shadow-inner">{`<Spoiler tagName="div">
  <img />
</Spoiler>`}</CodeHighlight>
          </MessageBubble>

          <div className="shadow-elevation-low mt-16 rounded-lg border border-zinc-200 bg-white px-7 pb-11 pt-8 text-center text-sm/5 font-medium text-neutral-800">
            <WavingHandIcon className="mx-auto mb-3 text-neutral-500" />
            As of 2024, CSS Houdini API is supported by the 70% of the browsers. We do have a
            fallback though,{" "}
            <Spoiler forceFallback theme="light">
              {" "}
              so here is what it will look like in Safari.
            </Spoiler>
          </div>
        </div>
      </main>

      <div className="px-4 pb-4 pt-14 text-center text-xs sm:fixed sm:bottom-4 sm:right-6 sm:max-w-60 sm:px-0 sm:pb-0 sm:text-right">
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
    </>
  );
};

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
