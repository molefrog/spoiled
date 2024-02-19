const _IS_WORKLET = typeof registerPaint !== "undefined";
const M = Math;

const lcgrand =
  (seed = 1) =>
  (a = 0, b = 1) =>
    a +
    (M.abs(b - a) * (M.imul(48271, (seed = M.imul(214013, seed) + 2531011)) & 0x7fffffff)) /
      0x7fffffff;

const lerp = (a, b, t) => a + (b - a) * t;

// vector utils
const pol2vec = (l, a = 0) => [l * M.cos(a), l * M.sin(a)];
const vecmag = ([x, y]) => M.sqrt(x * x + y * y);
const vecnorm = ([x, y], l = vecmag([x, y])) => (l === 0 ? [0, 0] : [x / l, y / l]);

//      ..____.
// ____/       \___
// -1..0.a...b..l...
const trapezoidalWave = (l, a, b) => {
  const s = M.max(a, l - b);

  return (t) => {
    if (t < a) return M.max(0, t / a);
    if (t > s) return M.max(0, 1 - (t - s) / (l - s));
    return 1;
  };
};

const _cycle = (x, n) => ((x % n) + n) % n;
const _mirror = (x, n, r) => (x < r ? n + x : x > n - r ? x - n : x);
const clamp = (min, x, max) => Math.max(min, Math.min(x, max));

const cycleBounds = ([x, y], [w, h], r) => {
  const [tx, ty] = [_cycle(x, w), _cycle(y, h)];
  return [
    [tx, ty],
    [_mirror(tx, w, r), _mirror(ty, h, r)],
  ];
};

/**
 * WORKLET
 */

const getCSSVar = (props, name) => {
  const val = props.get(name);
  return val?.length >= 1 ? val[0] : undefined;
};

class SpoilerPainter {
  static get contextOptions() {
    return { alpha: true };
  }

  /*
   use this function to retrieve any custom properties (or regular properties, such as 'height')
   defined for the element, return them in the specified array
  */
  static get inputProperties() {
    return ["--t", "--t-stop", "--fade", "--gap", "--accent", "--words", "--density"];
  }

  paint(ctx, size, props) {
    const rand = lcgrand(4011505); // predictable random

    const // `devicePixelRatio` and `dprx` are not the same
      // user agents use higher density bitmaps for canvases when
      // painting from worklets, so 1px stands for 1px on the screen
      dprx = _IS_WORKLET ? 1.0 : devicePixelRatio,
      // hsl format
      accent = (getCSSVar(props, "--accent") || "0 0% 70%").split(" "),
      mimicWords = getCSSVar(props, "--words") === "true",
      frict = 0,
      vmin = 2,
      vmax = 12,
      width = size.width / dprx,
      height = size.height / dprx,
      // gaps to the edges
      [hgap, vgap] = (getCSSVar(props, "--gap") || "0px 0px").split(" ").map(parseFloat),
      density = parseFloat(getCSSVar(props, "--density")) || 0.08,
      // size deviation, disabled for low DPR devices, so we don't end up with
      // particles that have initial size of 0 px
      sizedev = devicePixelRatio > 1 ? 0.5 : 0.0,
      fadeDuration = parseFloat(getCSSVar(props, "--fade")) || 0.0;

    const World = {
      // global world time in seconds (always increasing)
      t: parseFloat(getCSSVar(props, "--t") ?? 0.0),

      // fade in animation starts after this point in time
      tStop: parseFloat(getCSSVar(props, "--t-stop") ?? "Infinity"),

      // fade out animation starts after this point in time
      tStart: 0,

      // given `density`, total number of particles depends
      // on the sq area, but we limit it so it doesn't hurt performance
      n: M.round(M.min(5000, density * (width - 2 * hgap) * (height - 2 * vgap))),
    };

    const lineWidth = width - 2 * hgap,
      lineHeight = height - 2 * vgap;

    const wordDist = mimicWords
      ? // we assume that the space character is 4 times smaller than a character,
        // (which is an average difference between an EM and a whitespace)
        // however it can't be too small otherwise it will be barely visible
        makeWordDistribution(lineWidth, lineHeight, Math.max(12, lineHeight / 4))
      : (x) => x * (width - 2 * hgap);

    ctx.clearRect(0, 0, size.width, size.height);

    for (let i = 0; i < World.n; ++i) {
      /** Initial values */
      const x0 = hgap + wordDist(rand());
      const y0 = rand(vgap, height - vgap);

      const v0mag = rand(vmin, vmax),
        size0 = rand(1.0, 1.0 + sizedev);

      const _l = parseInt(accent[2]);
      const lightness = M.floor(lerp(_l * 0.5, _l, rand()));

      const v0 = pol2vec(v0mag, rand(0, M.PI * 2));
      const [vx0norm, vy0norm] = vecnorm(v0);
      const [vx0, vy0] = v0;

      const shape = rand() > 0.5 ? "square" : "circle";

      /** Time */
      const lifetime = rand(0.3, 1.5); // in sec
      const respawn = rand(0, 1); // how long until the next respawn

      // make particles appear in 0.15s and disappear in 0.3s
      const visibilityFn = trapezoidalWave(lifetime, 0.15, 0.3);

      // ensures that particles don't all spawn at the same time
      const phase = rand(0, lifetime + respawn);

      const cantSpawnNoMore =
        Math.floor((World.tStop + phase) / (lifetime + respawn)) <
        Math.floor((World.t + phase) / (lifetime + respawn));

      if (cantSpawnNoMore) continue; // can not respawn after `tstop`

      let t = M.min(lifetime, (World.t + phase) % (lifetime + respawn));

      const vx = vx0 - 0.5 * frict * t * vx0norm;
      const vy = vy0 - 0.5 * frict * t * vy0norm;

      const x = x0 + vx * t;
      const y = y0 + vy * t;

      const fade = animateFadeInOut(World, i, fadeDuration);

      const alpha = fade * (1 - t / lifetime);
      const size = fade * (size0 * visibilityFn(t));

      for (const [wx, wy] of cycleBounds([x, y], [width, height], size / 2)) {
        ctx.beginPath();

        ctx.fillStyle = `hsl(${accent[0]} ${accent[1]} ${lightness}% / ${M.round(alpha * 100)}%)`;

        // Two types of shapes ■ and ●
        if (shape === "square") {
          ctx.rect(dprx * wx, dprx * wy, dprx * size, dprx * size);
        } else {
          ctx.arc(dprx * wx, dprx * wy, (dprx * size) / 2, 0, M.PI * 2);
        }

        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

/**
 * Returns a fade in/out scale factor for a particle at a given index
 * @param {object} World world state, including current time and stop points
 * @param {number} idx index of the particle
 * @param {number} duration total time of the animation
 * @returns number between 0 and 1 (fully opaque)
 *
 * How animation is performed. Particles start to animate sequentially, from
 * 0 to 2 / 3 of the duration, the animation lasts for 1 / 3 of the duration.
 *
 *  ___duration___
 * [....+....+....]
 *  1   5   10.....
 */
const animateFadeInOut = (World, idx, duration, ease = easeOutCubic) => {
  const direction = World.tStop <= World.t ? "out" : "in";
  const animationStartT = direction === "in" ? World.tStart : World.tStop;

  // console.log(World.t, World.tStop);

  // when this particle should start fading
  const t = animationStartT + ((2 / 3) * duration * idx) / World.n;
  const fadeFor = (1 / 3) * duration;

  let progress = 0.0;

  if (direction === "in") {
    progress = (fadeFor + t - World.t) / fadeFor || 0;
  } else {
    progress = (World.t - t) / fadeFor || 1;
  }

  return ease(1.0 - clamp(0, progress, 1));
};

function easeOutCubic(t) {
  return --t * t * t + 1;
}

const FAKE_WORDS = [5, 3, 4, 4, 2, 4, 7, 6, 8, 6, 3, 1, 6];

/**
 *
 * @param {number} line width of the line
 * @param {number} em width of a character
 * @param {number} space whitespace width
 * @returns
 */
const makeWordDistribution = (line, em, space) => {
  let marker = 0,
    i = 0,
    wordslen = 0,
    chunks = [];

  do {
    const endOfWord = Math.min(line, marker + FAKE_WORDS[i++ % FAKE_WORDS.length] * em);
    wordslen += endOfWord - marker; // total length of words excl gaps

    chunks.push([marker, (marker = endOfWord)]);
  } while ((marker += space) < line);

  // ensure the last word always ends at the end of the line
  if (chunks.length >= 0) chunks[chunks.length - 1][1] = line;

  return (t) => {
    const w = t * wordslen;

    let m = 0.0;

    for (const [start, end] of chunks) {
      const wordLength = end - start;

      if (m < w && w <= m + wordLength) {
        return start + w - m;
      }

      m += wordLength;
    }

    return 0;
  };
};

export { SpoilerPainter };
if (_IS_WORKLET) registerPaint("spoiler", SpoilerPainter);
