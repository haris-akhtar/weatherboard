// Renders the PWA icons from one SVG. Run with `npm run icons` after changing the mark.
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const OUT = new URL('../public/icons/', import.meta.url)

const mark = (scale) => `
  <g transform="translate(16 16) scale(${scale}) translate(-16 -16)">
    <circle cx="20.5" cy="12" r="4.5" fill="#f2b544"/>
    <path d="M7 22.5h14.5a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6-1.4A4.75 4.75 0 0 0 7 22.5Z" fill="#f4f3ef"/>
  </g>`

// "any" icons have rounded corners; maskable icons are full-bleed with the mark
// inside the central safe zone, because the OS applies its own mask.
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#17181c"/>${mark(1)}</svg>`
const fullBleed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#17181c"/>${mark(0.72)}</svg>`
// Android status-bar badge: monochrome, alpha channel only.
const badge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 6 24 20"><path d="M7 22.5h14.5a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6-1.4A4.75 4.75 0 0 0 7 22.5Z" fill="#fff"/></svg>`

const render = (svg, size, name) =>
  sharp(Buffer.from(svg), { density: 600 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(new URL(name, OUT).pathname)

await mkdir(OUT, { recursive: true })
await Promise.all([
  render(rounded, 192, 'icon-192.png'),
  render(rounded, 512, 'icon-512.png'),
  render(fullBleed, 512, 'icon-maskable-512.png'),
  render(fullBleed, 180, 'apple-touch-icon.png'),
  render(badge, 96, 'badge-96.png'),
])
console.log('Icons written to public/icons/')
