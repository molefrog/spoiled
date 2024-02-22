import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import * as ReactDOM from "react-dom/client";

import { SpoilerPainter } from "../src/SpoilerPainter";

import "./demo.css";

const useVanillaSpoilers = () => {
  const firstRun = useRef(true);

  useLayoutEffect(() => {
    if (!firstRun.current) {
      return;
    }

    for (const el of document.querySelectorAll(".spoiler-vanilla")) {
      if (el instanceof HTMLElement) {
        const spoiler = new SpoilerPainter(el, { fps: 24 });

        el.addEventListener("click", () => {
          if (spoiler.isHidden) {
            spoiler.reveal();
          } else {
            spoiler.hide();
          }
        });
      }

      firstRun.current = false;
    }
  }, []);
};

const App = () => {
  useVanillaSpoilers();

  return (
    <main>
      <h1>
        砂の女 <spoiler>Woman in the Dunes: 1964 Japanese New Wave psychological thriller</spoiler>
      </h1>

      <p>
        Woman in the Dunes was nominated for an Oscar and is generally considered his masterpiece.
        <spoiler>
          <span>(Teshighara was the first Japanese director ever nominated.)</span>
        </spoiler>
        It stars <i>Eiji Okada</i>, who had come to international attention in Alain Resnais&apos;
        Hiroshima, Mon Amour. Kyoko Kishida, who plays the woman, had a long career. Teshighara used
        her several times again, and she appeared in Ozu&apos;s last film, An Autumn Afternoon
        (which will be shown again in our Auteurist Reprise series on May 26).
      </p>

      <div className="img" style={{ maxWidth: "20%" }}>
        <img
          src="https://m.media-amazon.com/images/M/MV5BMTMzMzUzMDcwNV5BMl5BanBnXkFtZTcwMzM3MDMwNw@@._V1_.jpg"
          alt="The Merge"
        />
      </div>

      <div className="img" style={{ maxWidth: "50%" }}>
        <img
          src="https://m.media-amazon.com/images/M/MV5BMTMzMzUzMDcwNV5BMl5BanBnXkFtZTcwMzM3MDMwNw@@._V1_.jpg"
          alt="The Merge"
        />
      </div>

      <p>
        The eroticism and nudity was very un-Japanese for mainstream cinema of the period, although
        our own former curator, Donald Richie, was already shocking some Tokyo sensibilities with
        what amounted to <code>“X-rated”</code> underground films. As the critic Gudrun Howarth
        wrote,
        <spoiler>
          “When the woman washing the man reacts to the touch of his skin and to the patterns of
          soap lather on his flesh, the sensual, almost tactile, participation of Teshigahara&apos;s
          camera creates one of the most <span className="inline-tag">erotic</span> love scenes ever
          photographed.”
        </spoiler>
      </p>

      <blockquote>
        Teshigahara&apos;s breakthrough film was Pitfall, adapted by Kobe Abe from his novel, and
        the two would collaborate again on
        <spoiler className="dark-theme">砂の女 Suna No Onna (Woman in the Dunes)</spoiler>. Abe was
        a member of the avant-garde who would be nominated several times for the Nobel Prize for
        Literature.
      </blockquote>

      <p>
        Teshigahara was a highly diversified member of the avant-garde arts community, a painter and
        sculptor as well as a filmmaker, and he was also skilled in ikebana (Japanese flower
        arrangement), of which his father had been a grand master. In the course of his career, he
        made several documentaries on artists like Antonio Gaudi and Jean Tinguely.
      </p>

      <div className="img">
        <img
          style={{ maxWidth: "100%" }}
          src="https://moma.org/wp/inside_out/wp-content/uploads/2014/02/Woman-in-the-Dunes-2.jpg"
          alt="The Merge"
        />
      </div>

      <p>
        Hiroshi Teshigahara (January 28, 1927 – April 14, 2001) was an avant-garde Japanese
        filmmaker.
      </p>

      <div className="increasing-block">
        <div className="spoiler-vanilla block" style={{ width: "16px" }}></div>
        <div className="spoiler-vanilla block" style={{ width: "32px" }}></div>
        <div className="spoiler-vanilla block" style={{ width: "64px" }}></div>
        <div className="spoiler-vanilla block" style={{ width: "96px" }}></div>
        <div className="spoiler-vanilla block" style={{ width: "320px" }}></div>
      </div>
    </main>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
