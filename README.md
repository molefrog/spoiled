## Spoiled: Hide your precious secrets

**Realistic `<Spoiler />` component for React**

Inspired by Telegram spoilers, **spoiled** renders an animated particle cloud covering text, inline
or block elements, keeping them hidden until revealed.

- Uses [CSS Painting API](https://caniuse.com/css-paint-api) (Houdini) to achive realistic rendering
  for inline elements. Comes with a static image **fallback**;

- Supports light/dark mode;

- You can choose from predefined content transitions (_fade/iris_), or create your own one;

### How to use?

Install the package, requires React 18:

```jsx
npm i spoiled
```

Wrap your text in a spoiler. By default, the spoiler reveals on hover, uses system color scheme and
creates a `span` element:

```jsx
// Reveals on hover
<Spoiler>
  Hogwarts is a high-tech <b>startup incubator</b>
</Spoiler>;

// Controlled
<Spoiler hidden={isHidden}>Neo opens a digital wellness retreat</Spoiler>;
```

All standard props are proxied to the underlying `span` element. You can also use `tagName` prop to
change the tag:

```jsx
<Spoiler className="custom" aria-label="total secret">
  Boo!
</Spoiler>;

// You can hide blocks as well!
<Spoiler tagName="div">
  <img />
</Spoiler>;
```
