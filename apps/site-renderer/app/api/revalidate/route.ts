import { NextResponse } from 'next/server';
import { handleRevalidateRequest } from '@/lib/revalidate-handler';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = handleRevalidateRequest({
    secret: process.env.REVALIDATE_SECRET,
    providedSecret: request.headers.get('x-revalidate-secret'),
    body,
    revalidateTag,
    revalidatePath,
  });

  return NextResponse.json(result.body, { status: result.status });
}
