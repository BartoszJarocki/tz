import { NextResponse } from 'next/server'
import fs from 'fs/promises'

export async function GET() {
  try {
    const filePath = 'public/apple-touch-icon.png'
    await fs.access(filePath)
    const file = await fs.readFile(filePath)
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Icon not found' }, { status: 404 })
  }
}
