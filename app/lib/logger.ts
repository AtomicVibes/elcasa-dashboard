export function log(
  event: string,
  data?: Record<string, unknown>,
) {
  console.log(JSON.stringify({ event, ...data }));
}

export function logError(
  event: string,
  error: unknown,
  data?: Record<string, unknown>,
) {
  const err =
    error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : { message: String(error) };

  console.error(
    JSON.stringify({ event, error: err, ...data }),
  );
}
