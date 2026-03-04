// Generates a 512x512 PNG logo for Reset Yoga (Stripe Connect use)
// Run: node scripts/generate-logo.mjs
// Requires: npm install canvas (or: npx --yes canvas)

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const SIZE = 512
const canvas = createCanvas(SIZE, SIZE)
const ctx = canvas.getContext('2d')

// ── Background: Navy #1B2B4B ─────────────────────────────────────────────────
ctx.fillStyle = '#1B2B4B'
ctx.beginPath()
// Rounded square (radius = 20% of size)
const r = SIZE * 0.20
ctx.moveTo(r, 0)
ctx.lineTo(SIZE - r, 0)
ctx.arcTo(SIZE, 0, SIZE, r, r)
ctx.lineTo(SIZE, SIZE - r)
ctx.arcTo(SIZE, SIZE, SIZE - r, SIZE, r)
ctx.lineTo(r, SIZE)
ctx.arcTo(0, SIZE, 0, SIZE - r, r)
ctx.lineTo(0, r)
ctx.arcTo(0, 0, r, 0, r)
ctx.closePath()
ctx.fill()

// ── Lotus / leaf motif (simplified) in Sage #7A8F6B ─────────────────────────
const cx = SIZE / 2
const cy = SIZE / 2 - 20

function drawPetal(ctx, x, y, angle, len, width) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.ellipse(0, -len / 2, width / 2, len / 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

ctx.fillStyle = '#7A8F6B'
const petals = 6
for (let i = 0; i < petals; i++) {
  const angle = (Math.PI * 2 / petals) * i - Math.PI / 2
  drawPetal(ctx, cx, cy, angle, 120, 44)
}

// Inner circle (lighter sage)
ctx.fillStyle = '#9BAF8C'
ctx.beginPath()
ctx.arc(cx, cy, 42, 0, Math.PI * 2)
ctx.fill()

// Center dot (navy)
ctx.fillStyle = '#1B2B4B'
ctx.beginPath()
ctx.arc(cx, cy, 18, 0, Math.PI * 2)
ctx.fill()

// ── "RY" text ────────────────────────────────────────────────────────────────
ctx.fillStyle = '#F2ECE3'
ctx.font = 'bold 80px sans-serif'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('RY', cx, SIZE * 0.82)

// ── Export PNG ───────────────────────────────────────────────────────────────
const out = join(__dir, '../public/logo-stripe.png')
writeFileSync(out, canvas.toBuffer('image/png'))
console.log(`✓ Saved: public/logo-stripe.png (${SIZE}×${SIZE}px)`)
