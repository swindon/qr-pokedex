# Mote

Mote is a morphing bot avatar you can dress and set in motion, then hand to someone else as a QR code. The same code always rebuilds the same bot: one body shape, one solid colour or gradient, one texture, and one default animation.

The picture is a single filled silhouette with two eye holes cut out of it. There is no animation library. `sample(time, shape, animation)` in `src/bot/engine.ts` is a pure function of time, so pausing, scrubbing, and the frozen gallery all draw the same frame a test would draw.

The visual idea — a radial profile that can morph, and eyes as mask holes — is inspired by [bloub](https://github.com/jeremy-prt/bloub) by Jérémy Perret (MIT). Mote is a separate catalogue and interface. It does not reuse that project’s measurements.

Not affiliated with, endorsed by, or connected to x.ai.

## Catalogue

These are real options in the UI, exported from `src/bot/catalog.ts` as `CATALOG_COUNTS` and checked by `pnpm test`:

| Catalogue | Count | Where |
| --- | ---: | --- |
| Body shapes | 110 | `src/bot/shapes.ts` |
| Animations, emotions, and reactions | 125 | `src/bot/animations.ts` |
| Solid colours | 112 | `src/bot/palette.ts` |
| Gradients (two or more stops) | 100 | `src/bot/palette.ts` |
| Textures | 56 | `src/bot/textures.ts` |

Shapes are radial profiles (superellipses, polygons, stars, flowers, gears, blobs, asymmetric lobes, and a few symbols such as a heart or shield). Animations are predefined. There is no timeline editor.

## Run it

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
pnpm test     # catalogue counts, motion, and QR encode/decode
pnpm build    # vue-tsc and the static site in dist/
pnpm preview  # serve dist/
```

The interface is English only. Choices are kept in `localStorage`. A link whose hash is a `mote1|...` payload opens that bot.

## QR codes

- **My QR** encodes the current bot as `mote1|<shape>|<s or g>|<colour or gradient>|<texture>|<animation>`. Scanning that code restores those exact catalogue entries.
- **Scanner** reads a code with the camera, or you can paste the decoded text. Any payload that is not a Mote code is hashed with SHA-256 and folded into catalogue indices, so the same text always yields the same bot.

## GitHub Pages

The Vite `base` is `./`, so the built files work at a project-site path such as `https://<user>.github.io/qr-pokedex/` without rewriting asset URLs.

This repository includes `.github/workflows/pages.yml`. It builds on every push to `main` and deploys with GitHub Actions.

1. Merge this project to `main`.
2. In the repository on GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main`, or run the “Deploy GitHub Pages” workflow by hand.
5. The site URL is printed on the workflow’s deploy job. For this repository that is `https://swindon.github.io/qr-pokedex/`.

To publish the `gh-pages` branch yourself instead of using the workflow:

```bash
pnpm build
# from a clean checkout of the gh-pages branch, copy the contents of dist/ to the branch root
```

Relative asset paths mean that branch works as a Pages source too. Do not add a second deploy path if the Actions workflow is already publishing the site.

## Layout

| Path | Role |
| --- | --- |
| `src/bot/` | Clock-free avatar engine and catalogues. No Vue imports. |
| `src/qr/` | SHA-256 and the payload mapping. |
| `src/components/` | Studio, scanner, gallery, and the QR share dialog. |
| `src/state/` | The current bot, playback clock, and hash routing. |

## License

MIT. See [LICENSE](LICENSE).
