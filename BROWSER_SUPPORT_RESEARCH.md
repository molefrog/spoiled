# Browser Support Research for Spoiled (November 2025)

## Executive Summary

**TL;DR:** Browser support for CSS Paint API has **NOT meaningfully improved** since the project was created. The unique requirement for inline element rendering with text wrapping means there are **no viable alternatives** to CSS Paint API. Firefox still lacks support, Safari support is unclear, and the recommended polyfill is unmaintained.

---

## Why CSS Paint API is Required

Unlike most visual effects that can be achieved with Canvas, SVG, or CSS filters, the spoiler effect has a critical constraint:

**Requirement:** Render animated backgrounds on **inline elements** that **wrap with text flow**.

### Why Alternatives Don't Work:

| Approach | Why It Fails for Inline Elements |
|----------|----------------------------------|
| **Absolutely positioned Canvas** | Cannot follow inline element reflow and text wrapping |
| **backdrop-filter** | Requires stacking context, doesn't respect inline boundaries well |
| **SVG filters** | SVG `<text>` doesn't support line wrapping natively; would need `<foreignObject>` which defeats the purpose |
| **background-image (static)** | Works for static images but not for animated particle effects |
| **WebGL/Canvas overlay** | Cannot conform to arbitrary inline element shapes across line breaks |

**CSS Paint API is the ONLY web platform API that allows programmatically generated backgrounds that:**
- Follow exact inline element boundaries
- Wrap across multiple lines with text
- Respect document flow
- Update dynamically with content changes

---

## Current Browser Support (November 2025)

### CSS Paint API

| Browser | Support Status | Version | Notes |
|---------|---------------|---------|-------|
| **Chrome** | ✅ Full Support | 65+ (since April 2018) | Stable, production-ready |
| **Edge** | ✅ Full Support | 79+ (Chromium-based) | Same as Chrome |
| **Opera** | ✅ Full Support | 47+ | Chromium-based |
| **Safari** | ⚠️ **Conflicting Information** | 16.4+ claimed partial support | Multiple sources conflict:<br>• Some claim partial support since 16.4 (May 2023)<br>• LambdaTest shows NO support through 18.4<br>• **Needs real-world testing** |
| **Firefox** | ❌ No Support | All versions | "Under consideration" with no timeline |

**Global Coverage:** ~70-75% (primarily Chromium browsers)

### CSS @property (Used for iris animation)

Used in `src/Spoiler.module.css:39-49` for animated custom properties.

| Browser | Support Status | Notes |
|---------|---------------|-------|
| **Chrome/Edge** | ✅ Full Support | Production ready |
| **Safari** | ✅ Full Support | As of March 2025 |
| **Firefox** | ❌ No Support | "Coming soon" (no timeline) |

**Impact:** The iris reveal animation (`transition="iris"`) won't work correctly in Firefox even with a Paint API polyfill.

### Other APIs Used

| Feature | Browser Support | Graceful Degradation |
|---------|----------------|---------------------|
| `IntersectionObserver` | ✅ 95%+ | ✅ Has feature detection (`src/SpoilerPainter.ts:308`) |
| `ResizeObserver` | ✅ 95%+ | ✅ Has feature detection (`src/hooks/useWatchResize.ts:37`) |
| `matchMedia` | ✅ 98%+ | ✅ Has feature detection |
| CSS `:has()` | ✅ Modern browsers (2022+) | ⚠️ No fallback |
| CSS `mask` | ✅ 95%+ (with prefixes) | ⚠️ Autoprefixer configured |
| `backdrop-filter` | ✅ 92%+ | Not currently used |

---

## Polyfill Status: Concerning

### css-paint-polyfill (GoogleChromeLabs)

**Repository:** https://github.com/GoogleChromeLabs/css-paint-polyfill

**Status:** ⚠️ **Appears unmaintained**

- **Last Release:** v3.4.0 (March 18, 2022) - **3 years ago**
- **Open Issues:** 17
- **Recent Activity:** Minimal (last issue July 2024, community-driven)
- **License:** Apache-2.0 (open source, can be forked)

**Performance Characteristics:**
- ✅ Good performance in Firefox and Safari (uses `-webkit-canvas()` / `-moz-element()`)
- ⚠️ Framerate limited by Canvas `toDataURL()` / `toBlob()` speed in other browsers
- ⚠️ May not support all Paint API features

**Recommendation:**
- Polyfill works but is aging
- Consider it a stopgap, not a long-term solution
- Test thoroughly before deploying
- May need to fork and maintain if critical bugs arise

---

## What Has Changed Since 2024?

### Improvements ✅
1. **Safari CSS @property support** - Now supports animated custom properties (as of March 2025)
2. **Safari Paint API** - Claims of partial support in 16.4+, but **conflicting reports**

### No Change ⚠️
1. **Firefox Paint API** - Still "under consideration", no progress
2. **Polyfill maintenance** - Still unmaintained since 2022
3. **Global browser support** - Still hovering around 70-75%

### Concerns 🚨
1. **Polyfill aging** - 3 years without updates is a risk
2. **No alternative technologies** - No new web platform APIs address this use case
3. **Browser vendor interest** - Mozilla shows no concrete interest in implementing

---

## Recommendations

### 1. Immediate: Documentation Updates

Update `README.md` to reflect current reality:

```diff
- As of 2024, CSS Houdini API is supported by the 70% of the browsers
+ As of November 2025, CSS Houdini Paint API is supported by ~70-75% of browsers
+ (Chrome/Edge/Opera). Firefox has no support, Safari support is unclear (partial in 16.4+).
+ The recommended polyfill has not been updated since March 2022.
```

Add a browser support matrix table for transparency.

### 2. Short-term: Enhance Fallback Experience

Current fallback is functional but could be improved:

**Current:** Static WebP images (16x16 tiled)
- Location: `src/assets/fallback-light.webp`, `fallback-dark.webp`
- Issue: Browsers without Paint API support may also lack WebP support (old Safari)

**Potential Improvements:**
1. **Add PNG fallback** for ancient browsers
2. **Animated GIF fallback** - More engaging than static image
3. **CSS animation on fallback** - Subtle shimmer/pulse effect to maintain some dynamism
4. **Better fallback styling** - Use `box-decoration-break: clone` for better inline rendering

### 3. Medium-term: Polyfill Integration Options

**Option A: Optional Peer Dependency**
```json
{
  "peerDependencies": {
    "css-paint-polyfill": "^3.4.0"
  },
  "peerDependenciesMeta": {
    "css-paint-polyfill": { "optional": true }
  }
}
```

**Option B: Bundled Polyfill** (increases bundle size)
- Conditionally import and register polyfill
- Use dynamic import for code-splitting

**Option C: External Documentation**
- Document how users can integrate polyfill themselves
- Provide setup instructions and caveats

### 4. Long-term: Monitor Alternative Technologies

Keep an eye on these emerging/evolving specs:

| Technology | Status | Potential |
|-----------|--------|-----------|
| **CSS Custom Highlight API** | ✅ Shipping in Chrome, Safari | Could enable highlight-based effects |
| **CSS Anchoring** | 🚧 In development | Better positioning for overlays |
| **View Transitions API** | ✅ Shipping | Could enhance reveal animations |
| **Offscreen Canvas** | ✅ Well-supported | Better performance for fallbacks |
| **WebGPU** | 🚧 Partial support | Future high-performance graphics |

**None of these solve the inline wrapping problem**, but they may enable hybrid approaches.

### 5. Testing Recommendations

**Critical Tests Needed:**

1. **Safari 16.4+ real-world testing**
   - Verify Paint API actually works
   - Test on macOS and iOS
   - Document findings

2. **Firefox with polyfill**
   - Test polyfill performance
   - Verify `@property` fallback for iris animation
   - Check for memory leaks with long-running animations

3. **Old Safari versions (< 16.4)**
   - Verify fallback image rendering
   - Check WebP support
   - Test inline wrapping with `box-decoration-break`

---

## Technical Debt to Address

### 1. ES2022 Target Without Transpilation

**Location:** `vite.config.ts:36`, `tsconfig.json`

**Issue:**
```typescript
// Using private class fields (#property) without transpilation
class SpoilerPainter {
  #forceFallback: boolean = false; // Won't work in older browsers
}
```

**Impact:**
- Code won't execute in browsers that don't support ES2022
- Browsers without Paint API support may also lack ES2022 support
- **Fallback won't work if JavaScript fails to parse**

**Fix:** Change target to `ES2020` or add transpilation step

### 2. Missing Browserslist Configuration

**Current:** No `.browserslistrc` file

**Impact:**
- Autoprefixer uses defaults (may not match target browsers)
- No clear communication of supported browsers
- Inconsistent with actual browser support

**Fix:** Add `.browserslistrc`:
```
# Modern browsers with some legacy support
> 0.5%
last 2 versions
Firefox ESR
not dead
not IE 11
```

### 3. WebP Fallback Images

**Location:** `src/assets/fallback-*.webp`

**Issue:** Browsers that don't support Paint API (old Safari) may not support WebP

**Fix:** Provide PNG fallbacks or use `<picture>` element approach

### 4. Missing Safari-Specific Detection

**Current:** Only checks for `CSS.paintWorklet` existence

**Issue:** Safari support is unclear, may need version-specific detection

**Fix:** Add Safari version detection and testing

---

## Alternative Rendering Approaches (For Consideration)

While none of these solve the inline wrapping problem perfectly, they could serve as enhanced fallbacks:

### Approach 1: Hybrid Canvas + CSS Regions
Use positioned canvas elements at line break positions, detected via `getClientRects()`.

**Pros:**
- Works in all browsers
- Animated effects possible

**Cons:**
- Complex to implement
- Performance overhead from layout detection
- May not update smoothly during resize

### Approach 2: Multi-Layer Background Images
Use multiple background images with `background-clip: text` and animations.

**Pros:**
- Pure CSS solution
- Good browser support

**Cons:**
- Cannot create particle-like effects
- Limited dynamism
- Doesn't respect inline boundaries perfectly

### Approach 3: SVG + foreignObject
Wrap content in SVG with filter effects.

**Pros:**
- SVG filters well-supported
- Can create interesting effects

**Cons:**
- SVG doesn't handle text wrapping
- `foreignObject` has layout quirks
- Complex to implement correctly

**Conclusion:** None of these approaches are better than the current Paint API + fallback strategy. They're documented here for completeness but not recommended.

---

## Conclusion

**The harsh reality:** The web platform lacks a good solution for animated, dynamically-generated backgrounds on inline elements. CSS Paint API was supposed to be that solution, but browser adoption has stalled.

**Your current approach is optimal given the constraints:**
1. ✅ Use Paint API where available (best experience)
2. ✅ Provide static fallback (acceptable experience)
3. ✅ Allow customization via `fallback` prop
4. ✅ Support `forceFallback` for testing

**Recommended next steps:**
1. Update documentation to reflect current browser support reality
2. Test Safari 16.4+ to verify actual Paint API support
3. Consider enhancing the fallback experience (animated GIF, CSS animations)
4. Fix ES2022 transpilation issue to ensure fallback works everywhere
5. Add browserslist configuration for clarity
6. Consider optional polyfill integration with clear documentation of risks

**The bottom line:** Don't expect browser support to improve in the near future. Firefox has shown no interest, Safari support is unclear, and the polyfill is unmaintained. This is a "build with what we have" situation, and your current implementation is already quite good given the limitations.

---

**Research Date:** November 17, 2025
**Researcher:** Claude (Anthropic)
**Codebase Version:** 0.4.0
