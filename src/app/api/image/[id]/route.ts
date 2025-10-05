import type { NextRequest } from 'next/server';
import { images } from '../../images/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const img = images.find((im) => im.id === id);

  if (!img) {
    return new Response(JSON.stringify({ error: 'Image not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response(JSON.stringify(img), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
