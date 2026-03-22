# Design System Strategy: Cinematic Admin

## 1. Overview & Creative North Star
### Creative North Star: "The Obsidian Observatory"
This design system moves away from the sterile, white-label appearance of traditional administration tools. Instead, it adopts a high-end editorial aesthetic designed for focus and immersion. By utilizing deep tonal depth, intentional asymmetry, and "glass-on-glass" layering, we transform a university portal into a powerful, cinematic command center. 

The system breaks the "template" look by avoiding rigid grid-line containers in favor of organic spatial relationships. We use a high-contrast typography scale to create an authoritative voice, ensuring that data visualization and critical administrative tasks feel premium and deliberate.

---

## 2. Colors
The palette is built on a foundation of "Deep Space" neutrals, punctuated by high-energy electric accents that guide the eye toward primary actions and critical data.

### The "No-Line" Rule
**Explicit Instruction:** Use of 1px solid borders for sectioning content is strictly prohibited. Use background color shifts (e.g., a `surface-container-low` section sitting on a `surface` background) to define boundaries. This creates a more sophisticated, seamless UI that feels carved rather than outlined.

### Surface Hierarchy & Nesting
Depth is achieved through a stacking logic of tokens. Treat the interface as physical layers:
*   **Base:** `surface` (#0e0e0e)
*   **Low Elevation:** `surface-container-low` (#131313) for secondary content areas.
*   **High Elevation:** `surface-container-highest` (#262626) for active modals or prioritized cards.
Each inner container must use a different tier than its parent to define importance without structural lines.

### The "Glass & Gradient" Rule
To achieve a "bespoke" feel, use **Glassmorphism** for floating elements. Use semi-transparent variants of `surface-container` with a `backdrop-blur` (min 20px). Main CTAs should utilize a signature gradient from `primary` (#81ecff) to `primary-container` (#00e3fd) to provide a "glow" effect that flat colors lack.

---

## 3. Typography
The system uses a pairing of **Space Grotesk** for display/headlines and **Inter** for functional reading.

*   **Display & Headlines (Space Grotesk):** Provides a technical, slightly brutalist edge that feels modern and academic. High tracking-reduction on `display-lg` adds a cinematic quality.
*   **Body & Titles (Inter):** Chosen for its exceptional legibility in dark environments.
*   **Hierarchy as Identity:** Use `headline-lg` for dashboard section headers to create an editorial "magazine" feel. Labels (`label-md`) should be strictly uppercase with +5% letter spacing to distinguish them from interactive titles.

---

## 4. Elevation & Depth
We define hierarchy through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural "lift."
*   **Ambient Shadows:** For floating elements (Modals, Tooltips), use "Ambient Glows." Shadows must be extra-diffused (Blur: 40px+) and low-opacity (4%-8%). Use the `on-surface` color for the shadow tint to mimic natural light interaction.
*   **The "Ghost Border" Fallback:** If a container requires further definition for accessibility, use the "Ghost Border"—the `outline-variant` token at **15% opacity**. Never use 100% opaque borders.
*   **Glassmorphism Depth:** Elements like the SQL query results or "Ask a question" bar should feel like they are floating above the content using `surface-variant` with a 0.8 alpha and heavy backdrop blur.

---

## 5. Components

### Buttons
*   **Primary:** Signature gradient (`primary` to `primary-container`) with `on-primary` text. No border. Roundedness: `md` (0.75rem).
*   **Secondary:** `surface-container-high` background with a "Ghost Border."
*   **Tertiary:** Ghost button style; `primary` text color, no background until hover.

### Input Fields
*   **Text Inputs:** Use `surface-container-low`. The active state should not use a thick border; instead, use a 1px "Ghost Border" of `primary` and a subtle inner glow.
*   **Selection Chips:** Pill-shaped (`full` roundedness). Selected state uses `secondary-container` with `on-secondary-container` text.

### Cards & Lists
*   **Rule:** Forbid divider lines. Use `1.5rem` (Spacing 6) of vertical white space or a subtle shift to `surface-container-lowest` for alternating rows.
*   **Query Results Table:** The header should be `surface-container-high`, and the body rows should be `surface`. This "dark header" approach emphasizes the data over the container.

### Data Visualization
Charts should utilize the `primary` (#81ecff), `secondary` (#a68cff), and `tertiary` (#70aaff) tokens. Use "Glow Lines"—applying a blur effect to a thin stroke—to create a cinematic, holographic feel for line graphs.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `surface-container` tiers to create hierarchy.
*   **Do** use asymmetrical layouts for Hero sections (e.g., text aligned left, data viz slightly offset to the right).
*   **Do** use large, bold typography for "Empty States" to maintain the cinematic tone.
*   **Do** ensure a 4.5:1 contrast ratio between `on-surface` and `surface` variants for accessibility.

### Don't
*   **Don't** use 1px solid white or grey borders to separate sections.
*   **Don't** use standard "Drop Shadows" (0, 4, 4, 0). Always use high-blur, low-opacity ambient shadows.
*   **Don't** use pure white (#FFFFFF) for long-form body text; use `on-surface-variant` (#adaaaa) to reduce eye strain in dark mode.
*   **Don't** overcrowd the interface. If the UI feels "busy," increase spacing using the `spacing-12` (3rem) or `spacing-16` (4rem) tokens.