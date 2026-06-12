export async function GET(): Promise<Response> {
  return Response.json(
    {
      status: 'ok',
      service: 'site-renderer',
      at: new Date().toISOString(),
    },
    { status: 200 },
  );
}
