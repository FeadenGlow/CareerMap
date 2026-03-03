export function extractErrorMessage(
  err: unknown,
  fallback: string = 'Something went wrong',
): string {
  if (!err || typeof err !== 'object' || !('response' in err)) {
    return fallback;
  }
  const msg = (err as { response?: { data?: { message?: string } } }).response
    ?.data?.message;
  return typeof msg === 'string' && msg.length > 0 ? msg : fallback;
}
