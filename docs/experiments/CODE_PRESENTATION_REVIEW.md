# Code presentation and Google Sans Code

Reviewed 12 November 2026 against `d3d637d`. The user reported [uncolored code and a wrapped Copy code action](captures/code-presentation/user-reference.png), then selected Google Sans Code for code text.

## Implementation

Code blocks and inline code now use locally hosted Google Sans Code, with normal monospace fallbacks. The upright Latin variable WOFF2 is 34,948 bytes and supports weights 300–800. Font sizes and line heights remain whole CSS pixels, and optional ligatures are disabled. The original font name is preserved and its SIL Open Font License ships beside the font. [Asset provenance](data/google-sans-code.json) records source URLs, timestamps, and hashes. UI prose and action labels retain Inter.

A shared `HighlightCode` directive uses highlight.js 11.12.0 core with only TypeScript, XML/HTML, and Bash grammars. It covers standalone gallery components, import snippets, Angular templates, quick-start documentation, and terminal examples. Local CSS tokens provide distinct keyword, string, type, number, attribute, and comment colors in each theme. Highlighting is computed from source/language signals and produces the same markup during SSR and hydration. Angular sanitizes the normal `innerHTML` binding; no sanitizer bypass or post-hydration DOM rewriting is used. Unknown languages display escaped plain text. Clipboard actions continue to copy the original source string.

The previous spacing rule accidentally applied a fixed 32 px icon-only width to the text copy action. Icon-only integration controls now keep their separate sizing. The text action has a 100 px minimum width, 32 px minimum height, fixed flex sizing, aligned icon/text, and a nonwrapping label. Copy feedback retains that width. The surrounding toolbar may wrap its descriptive title on narrow screens while the action stays intact.

The highlighter belongs to the demo and is included explicitly in its isolated runtime fixture. No dependency or font asset enters the chart-library package. The complete BSD notice is served with demo assets; language modules are selected through direct imports. The production build emits a roughly 34.6 kB raw / 12.2 kB estimated-transfer shared highlighting chunk rather than the full language collection.

## Verification

The complete `npm run check` passed: formatting, production builds, strict compilation, 51 unit/integration tests, copied-component/declaration checks, SSR, 85 browser scenarios (two CDP-only skips), isolated client/SSR runtime consumers in all three engines, and the unchanged chart-library size budget.

The new unit checks preserve exact source characters, keep HTML/script-looking text inert, update highlighted Angular bindings, and handle unknown language names. Six new browser scenarios cover every gallery variant at 320/768/1440 px in both themes: distinct token colors, an actually loaded Google Sans Code face, one-line copy labels with aligned icons, exact plain-text copying, responsive containment, documentation grammars, and SSR/hydration.

## Captures

The [manifest](captures/code-presentation/manifest.json) records production capture conditions and hashes. Reviewed views: [Gradient dark](captures/code-presentation/gradient-dark.png), [light](captures/code-presentation/gradient-light.png), [mobile](captures/code-presentation/gradient-mobile.png), [Angular template](captures/code-presentation/playground-template.png), and [quick-start example](captures/code-presentation/quick-start.png).
