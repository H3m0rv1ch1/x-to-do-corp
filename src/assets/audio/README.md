Audio assets for Focus Mode

Structure:
- ambient/ — built-in background loops you ship with the app (e.g., rain, cafe, forest, lofi, piano).
- music/ — longer music tracks (e.g., mixes or playlists) you want pre-bundled.

Where to put files:
- Place your audio files inside `src/assets/audio/ambient/` or `src/assets/audio/music/`.
- Supported formats: mp3, m4a, wav, ogg.

How we will reference files in code:
- For files under `src/assets`, Vite requires using URL imports. Example:

  // inside a TS/TSX module
  const lofiUrl = new URL('../../assets/audio/ambient/lofi.mp3', import.meta.url).href;

- We will add them to the Focus Mode ambient list like:

  const AMBIENT_SOUNDS = {
    none: { label: 'None', src: '' },
    lofi: { label: 'Lofi', src: lofiUrl },
    // more entries...
  } as const;

Next steps:
1) Drop your files into the folders below.
2) Tell me the exact filenames and which category (ambient vs music).
3) I will wire them into the UI so they show up as selectable options.