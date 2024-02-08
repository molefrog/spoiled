import "./demo.css";
import { Spoiler } from "../src/index";

for (const el of document.querySelectorAll("spoiler, .spoiler")) {
  if (el instanceof HTMLElement) {
    const accent = el.classList.contains("dark-theme") ? "rgb(200, 200, 200)" : undefined;

    const spoiler = new Spoiler(el, { fps: 24 /*, accentColor: accent */ });
  }
}
