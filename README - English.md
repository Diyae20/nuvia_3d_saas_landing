\# Nuvia — Beyond artificial



\## Project and objective

A conceptual SaaS/AI landing page—fully static—centered around an organic, iridescent 3D sphere. Art direction: near-black background, Space Grotesk / DM Sans typography, almond-green accents, and glass with cyan, magenta, and violet reflections. Demo content is in English. Nuvia and its branding elements are a creative concept, not an operational AI service.



\## Implemented features

\- Responsive hero section: headline, description, glowing CTA, and an explanatory preview within a native dialog box.

\- Real WebGL scene using Three.js, React Three Fiber, and drei’s Environment/Lightformer components.

\- Deformed spherical geometry featuring slow rotation and a floating idle state.

\- MeshPhysicalMaterial: transmission, thickness, refractive index, roughness, iridescence, and clearcoat.

\- Custom vertex shader: ripples and 3D noise with local deformation at the hover point. Normals recalculated so reflections track the deformation. Fragment shader: cyan/magenta tint based on pointer position and viewing angle.

\- Hover detection via raycasting against the actual geometry, even as the sphere shifts position during scrolling. Page-level movement tracking to avoid dependency on a canvas positioned behind the content.

\- Studio reflections oriented via `scene.environmentRotation` (the source used by drei), avoiding a full cubemap recalculation on every frame. Smooth easing of the deformation effect as the cursor leaves the sphere.

\- GSAP + ScrollTrigger: text fade and movement; sphere scaling and centering; rotation and continuous material transition from glass to chrome metal.

\- Tracking stops at the "Always evolving." section: the sphere remains anchored to this section and scrolls off-screen along with it. On scrolling back up, tracking resumes, and the center-to-right / chrome-to-glass transition reverses just as before. Targeted CSS fix: the negative overlap margin now belongs to the hero section rather than the sticky container, ensuring the actual bottom boundary is respected.

\- Second immersive section, illustrative brand banner, Think/Create/Evolve cards, vision statement, and contact section.

\- Mobile menu, anchor links, keyboard controls, Escape-key closing for overlays, and `prefers-reduced-motion` support.

\- CSS fallback visual if WebGL or 3D imports are unavailable; navigation operates independently of 3D loading. A visible status indicator distinguishes between loading, interactive rendering, and unavailability (due to internet or WebGL issues). The fallback is hidden only after the sphere has rendered for the first time.

\- Interest form featuring email validation and \*\*local-only\*\* storage. The interface clarifies that no emails are sent and no remote registrations are created.



\## Stack and execution

\- HTML5, CSS3, JavaScript ES modules; no application server or mandatory build step required.

\- React 18.3.1, Three.js 0.170.0, React Three Fiber 8.17.10, and drei 9.117.3 via esm.sh and import maps.

\- GSAP / ScrollTrigger 3.12.5 via jsDelivr.

\- Tailwind CSS Play CDN for layout utilities; custom CSS for art direction and media queries.

\- Google Fonts: Space Grotesk and DM Sans.

\- DPR capped at 1.5 for desktop and 1.25 for mobile; studio environment captured once at 128 resolution.



\### Opening the downloaded folder

1\. Extract the \*\*entire\*\* site folder, keeping `index.html`, `css/`, and `js/` together. 2. Stay connected to the Internet, then open `index.html` in a modern browser (Chrome, Edge, Firefox, or Safari supporting import maps and WebGL).

3\. Wait for the libraries to finish loading: the status changes from "Loading interactive 3D…" to "Move your cursor…".

4\. If only the CSS shape remains visible, check the status, verify your connection, check for CDN blocking or browser graphics acceleration issues, and then reload.



\*\*Local launch fix:\*\* `js/scene.js` is now a standard script loaded with `defer`, rather than a local module blocked by `file://` restrictions. It imports only CORS-enabled \*\*HTTPS\*\* dependencies via `import()` and the import map. No local file `fetch()` or local ES imports are required for the site.



This is \*\*not a fully offline version\*\*: an Internet connection is still required for React, Three.js, R3F/drei, GSAP, Tailwind, and fonts. Opening via HTTP(S) is also supported. No tokens, API keys, or external HDRIs are used. If browser or corporate security policies block remote imports from a local file, use a local static server preview (e.g., VS Code's Live Server) without disabling browser security.



\## File Structure

```text

index.html           Content and import map

css/style.css        Art direction, components, responsiveness

js/interface.js      Navigation, dialog, form, and GSAP

js/scene.js          Standard entry point, CDN imports

tests/smoke.html     Verification suite for the live site within an iframe

tests/smoke.js       Browser-based functional assertions

tests/interaction.html + .js   Tests for hover, noise, reflections, and scrolling

tests/local-origin.html + .js  Test for CDN imports in an opaque/null origin

tests/opaque-probe.js          WebGL rendering probe for the opaque origin test

tests/scroll-stop.html + .js   Regression test for sticky positioning and scroll-back behavior

```



\## Functional inputs and parameters

\- `/` or `/index.html`: main page.

\- `/#hero-section`: home/hero section.

\- `/#intelligence`: transition to the UI chrome.

\- `/#possibilities`: conceptual feature cards.

\- `/#about`: vision statement.

\- `/#contact`: local interest form.

\- `/tests/smoke.html`: automated interface checks; accepts no parameters and does not persist test data.

\- `/tests/interaction.html`: `pointermove` events on the live site, sphere enter/exit, noise/RGB uniforms, environment rotation, chrome transition, and hover states after scrolling.

\- `/tests/local-origin.html`: loads the same assets into an iframe with an opaque origin (`null`), using CDN imports and actual WebGL rendering. Must be opened via HTTP(S), as the test suite (unlike the site itself) reads files using `fetch()`.

\- `/tests/scroll-stop.html`: navigates the live page within a viewport-sized iframe; verifies the sphere anchoring at the second section, its exit from the screen, and the return path to the hero section. Leaves the page positioned 120px past the stop point for visual inspection.

\- No query parameters required. ## Data and storage

No tables, APIs, remote databases, or authentication infrastructure.



Browser key `localStorage\["nuvia-interest"]`:

```json

{

"email": "address entered by the visitor",

"savedAt": "ISO 8601 date"

}

```

A new submission overwrites the previous one on the same browser. Data does not leave the device. The form reports errors if local storage is blocked. To clear the information, delete this key or the site data in the browser.



The transient state `window.nuviaScene.progress` (0 to 1) links ScrollTrigger to the scene; it is not saved. `window.nuvia3D` exposes only ephemeral rendering diagnostics (ready state, hover, projected coordinates, uniforms, environment rotation) for testing purposes; no data is transmitted. The form is a demonstration, not a real waitlist.



\## Checks

\- Actual rendering verified in the browser on desktop (1280 × 800) and mobile (390 × 844).

\- Visual check of the second screen after scrolling and of the chrome material.

\- Sticky behavior check: bug reproduced prior to fix (canvas remained at `top: 0` while text scrolled up), followed by successful post-fix tests: after an additional 190px of scrolling, both the canvas and the section move up by 190px. Verified exit with the section, resumption upon scrolling back up, and return to the initial position. Test screenshots: desktop (1280 × 800) and mobile (390 × 844).

\- Browser tests: no horizontal overflow, title readability, dialog open/close, menu open/close, form validation, local storage with pre-existing value restoration, GSAP progress, text fade-out, and WebGL initialization.

\- Specific regression tests: shader compilation, noise increase on hover, RGB coordinate changes, true environment rotation on both axes, return to rest state when leaving the object, interaction maintained after scrolling.

\- Dependency loading and WebGL rendering confirmed within an opaque `null` origin. This test isolates module origin restrictions but \*\*does not replace physically opening the downloaded folder on the user's PC\*\*; the latter cannot be executed using the verification tools available here.

\- The test browser's software rendering may trigger GPU warnings and slow down transitions. The Tailwind Play CDN also issues its production usage warning. These are not JavaScript errors.



\## Not implemented / limitations

\- No AI engine, user accounts, payment processing, or server-side processing.

\- No remote registration, newsletter, email sending, or analytics.

\- No pre-rendered video: "See it in motion" explains and launches the actual interactive experience.

\- No generated images or Spline/Midjourney files; the sphere is calculated within the browser.

\- 3D quality and smoothness depend on the GPU and browser. The CSS fallback visual lacks glass-like physics.

\- Mobile touch retains native scrolling, without hover interaction. A mouse also works on narrow viewports; screen width no longer disables hover effects. - In "Reduce Motion" system mode, auto-rotation stops, as do pointer reactions are significantly reduced.

\- No offline package containing all dependencies; an Internet connection is still required, even for local access.



\## Public URLs and APIs

\- Production URL: not deployed during this phase; no URL provided.

\- Application API: none.

\- Publishing is possible via the \*\*Publish\*\* tab; a Hosted Deploy requires an explicit request and approval.



\## Recommended next steps

1\. Customize branding, text, illustrative imagery, and the CTA's commercial destination.

2\. For actual data collection, replace local storage with a database table via the Table API, including appropriate privacy notices and access rules.

3\. For a robust production deployment, compile Tailwind and bundle/localize JS dependencies rather than relying on the Play CDN and on-the-fly imports.

4\. Test performance on physical devices, particularly iOS Safari and entry-level Android devices; consider adaptive quality and pausing the scene when off-screen.

5\. Add legal notices and publish once the final content has been approved.

