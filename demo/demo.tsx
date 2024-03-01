import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";

import { Spoiler } from "../src/Spoiler";
import { useMatchMedia } from "../src/hooks/useMatchMedia";
import { GIFMaker } from "./GIFFallbackMaker";

import "./demo.css";

const App = () => {
  const reducedMotion = useMatchMedia("(prefers-reduced-motion: reduce)");
  const isDarkScheme = useMatchMedia("(prefers-color-scheme: dark)");

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
    <main>
      {false && <GIFMaker />}
      <h1>
        砂の女{" "}
        <Spoiler
          hidden={timeBased}
          noiseFadeDuration={2}
          className="header-text"
          aria-label="Woman in the Dunes"
        >
          Woman in the Dunes: 1964 Japanese New Wave psychological thriller
        </Spoiler>
      </h1>
      <p>
        Woman in the Dunes was nominated for an Oscar and is generally considered his masterpiece.
        <Spoiler density={0.2}>
          <span>(Teshighara was the first Japanese director ever nominated)</span>
        </Spoiler>
        . It stars <i>Eiji Okada</i>, who had come to international attention in Alain Resnais&apos;
        Hiroshima, Mon Amour. Kyoko Kishida, who plays the woman, had a long career. Teshighara used
        her several times again, and she appeared in Ozu&apos;s last film, An Autumn Afternoon
        (which will be shown again in our Auteurist Reprise series on May 26).
      </p>
      <div className="images">
        <div className="img">
          <img
            src="https://image.tmdb.org/t/p/original/f0JpsMQ9oEjKBD66Ky3qK3z7LGT.jpg"
            alt="Movie poster"
          />
        </div>

        <div className="img">
          <img
            src="https://m.media-amazon.com/images/M/MV5BMTMzMzUzMDcwNV5BMl5BanBnXkFtZTcwMzM3MDMwNw@@._V1_.jpg"
            alt="The Merge"
          />
        </div>
      </div>
      <p>
        The eroticism and nudity was very un-Japanese for mainstream cinema of the period, although
        our own former curator, Donald Richie, was already shocking some Tokyo sensibilities with
        what amounted to <code>“X-rated”</code> underground films. As the critic Gudrun Howarth
        wrote,
        <Spoiler revealOn="click">
          “When the woman washing the man reacts to the touch of his skin and to the patterns of
          soap lather on his flesh, the sensual, almost tactile, participation of Teshigahara&apos;s
          camera creates one of the most <span className="inline-tag">erotic</span> love scenes ever
          photographed.”
        </Spoiler>
      </p>
      <blockquote>
        Teshigahara&apos;s breakthrough film was{" "}
        <Spoiler accentColor="#fe8294">
          Pitfall, adapted by Kobe Abe from his novel, and the two would collaborate again on 砂の女
          Suna No Onna (Woman in the Dunes)
        </Spoiler>
        . Abe was a member of the avant-garde who would be nominated several times for the Nobel
        Prize for <Spoiler theme="dark">Literature</Spoiler>.
      </blockquote>
      <p>
        Teshigahara was a highly diversified member of the avant-garde arts community, a painter and
        sculptor as well as a filmmaker, and he was also skilled in ikebana (Japanese flower
        arrangement), of which his father had been a grand master. In the course of his career, he
        made several documentaries on artists like Antonio Gaudi and Jean Tinguely.
      </p>
      <Spoiler tagName="div" className="img" fps={20} revealOn="hover" transition="none">
        <img
          style={{ maxWidth: "100%" }}
          src="https://moma.org/wp/inside_out/wp-content/uploads/2014/02/Woman-in-the-Dunes-2.jpg"
          alt="The Merge"
        />
      </Spoiler>
      <p>
        Hiroshi Teshigahara (January 28, 1927 – April 14, 2001) was an avant-garde Japanese
        filmmaker.
      </p>
      <hr />
      <p>
        <small>
          Prefers reduced motion: <code>{String(reducedMotion)}</code>
          <br />
          Prefers color scheme: <code>{isDarkScheme ? "dark" : "light"}</code>
        </small>
      </p>
    </main>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
