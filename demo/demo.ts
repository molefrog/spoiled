import "./demo.css";
import { Spoiler } from "../src/Spoiler";

document.addEventListener("DOMContentLoaded", () => {
  for (const el of document.querySelectorAll("spoiler, .spoiler")) {
    if (el instanceof HTMLElement) {
      const _accent = el.classList.contains("dark-theme") ? "rgb(200, 200, 200)" : undefined;

      const spoiler = new Spoiler(el, { fps: 24 /*, accentColor: _accent */ });

      el.addEventListener("click", () => {
        if (spoiler.isHidden) {
          spoiler.reveal();
        } else {
          spoiler.hide();
        }
      });
    }
  }
});
