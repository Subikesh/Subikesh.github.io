// One-off: re-export project screenshots from /images (source of truth) into
// public/images as sized, compressed WebP for the site.
import sharp from 'sharp'
import { readdir, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'images'
const OUT = 'public/images'
const MAX_W = 1280

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

for (const file of await readdir(SRC)) {
  const base = path.parse(file).name
  const img = sharp(path.join(SRC, file))
  const meta = await img.metadata()
  const out = path.join(OUT, `${base}.webp`)
  await img
    .resize({ width: Math.min(meta.width ?? MAX_W, MAX_W), withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out)
  console.log(`${file} ${meta.width}x${meta.height} -> ${out}`)
}
