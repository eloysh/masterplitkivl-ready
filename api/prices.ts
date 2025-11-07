import type { VercelRequest, VercelResponse } from '@vercel/node'
import { list, put } from '@vercel/blob'

// file key in Blob storage
const KEY = 'prices.json'

function unauthorized(res: VercelResponse) {
  res.status(401).setHeader('WWW-Authenticate', 'Basic realm="admin"').send('Unauthorized')
}

function checkAuth(req: VercelRequest) {
  const header = req.headers['authorization']
  if (!header) return false
  const expectedUser = process.env.ADMIN_USER || ''
  const expectedPass = process.env.ADMIN_PASS || ''
  try {
    const [type, token] = header.split(' ')
    if (type !== 'Basic') return false
    const [u, p] = Buffer.from(token, 'base64').toString('utf8').split(':')
    return (u === expectedUser && p === expectedPass)
  } catch {
    return false
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // If admin auth provided and valid, return current content (or default)
      // Otherwise, still return public content
      const token = process.env.BLOB_READ_WRITE_TOKEN
      const { blobs } = await list({ token, prefix: KEY })
      const found = blobs.find(b => b.pathname === KEY) || blobs[0]
      if (found?.url) {
        const r = await fetch(found.url)
        const json = await r.json()
        return res.status(200).json(json)
      }
      // Fallback initial
      return res.status(200).json({
        base: {
          bathroom: { tile: 1800, porcelain: 1800 },
          backsplash: { tile: 1800, porcelain: 1800 },
          floor: { tile: 1800, porcelain: 1800 },
        },
        extras: {
          demolitionPerM2: 200,
          waterproofingPerM2: 250,
          prepPerM2: 140,
          adhesivePerM2: 220,
          groutPerM2: 130,
          miterPerLm: 250,
          siliconePerLm: 90,
          packageDiscountPct: 5,
        },
        coefficients: {
          normal: 1.0,
          diagonal: 1.1,
          largeFormat: 1.15,
          mosaic: 1.2,
        },
      })
    }

    if (req.method === 'POST') {
      if (!checkAuth(req)) return unauthorized(res)
      const token = process.env.BLOB_READ_WRITE_TOKEN
      if (!token) return res.status(500).send('Missing BLOB_READ_WRITE_TOKEN')

      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})
      await put(KEY, body, {
        access: 'public',
        token,
        contentType: 'application/json; charset=utf-8',
        addRandomSuffix: false,
      })
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET,POST')
    return res.status(405).send('Method Not Allowed')
  } catch (e: any) {
    console.error(e)
    return res.status(500).send('Server Error')
  }
}
