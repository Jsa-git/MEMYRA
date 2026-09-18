import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return ['180', '192', '512'].map((size) => ({ size }));
}

// Vector monogram; all identifying strokes fit inside the maskable safe circle.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#2B1833"/>
  <circle cx="256" cy="256" r="178" fill="none" stroke="#8066A3" stroke-width="2"/>
  <path d="M187 352V163h70c61 0 92 27 92 68s-32 69-93 69h-37" fill="none" stroke="#F4ECDF" stroke-width="17" stroke-linejoin="round"/>
  <path d="M219 352V196h34c41 0 61 12 61 35s-20 36-61 36" fill="none" stroke="#8066A3" stroke-width="6"/>
  <circle cx="319" cy="344" r="11" fill="#A7C957"/>
</svg>`;

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  if (!['180', '192', '512'].includes(size)) return new Response(null, { status: 404 });
  const png = await sharp(Buffer.from(icon)).resize(Number(size), Number(size)).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
  });
}
