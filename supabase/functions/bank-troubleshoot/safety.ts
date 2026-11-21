export function validateProblem(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length < 10 || value.length > 2000) {
    throw new Error('Describe the problem in 10–2,000 characters.');
  }
  // Reject likely credentials/PII rather than forwarding them to a model.
  if (/(?:access|public|link)-[a-z]+-[\w-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+|\b[0-9a-f]{24,}\b|\b\d[\d -]{7,}\d\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:password|secret|token|api[_ -]?key|account[_ -]?number|routing[_ -]?number)\s*(?:is|:|=)\s*\S+/i.test(value)) {
    throw new Error('Remove passwords, keys, tokens, account numbers, and personal details before submitting.');
  }
  return value.trim();
}

export function gatewayFailure(error: unknown) {
  const e = error as { statusCode?: number; responseBody?: string; message?: string };
  let body: { message?: string; type?: string; error?: { message?: string; type?: string } } = {};
  try { body = JSON.parse(e.responseBody ?? '{}'); } catch { /* No safe structured message. */ }
  const status = e.statusCode ?? 500;
  const type = body.type ?? body.error?.type ?? 'unknown';
  const safeMessage = body.message ?? body.error?.message;
  return {
    status,
    type,
    message: safeMessage ?? (status === 429 ? 'AI troubleshooting is busy. Please try again later.' : 'AI troubleshooting is unavailable. Please try again later or contact support@finityo.com.'),
  };
}