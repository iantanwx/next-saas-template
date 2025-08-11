export function must<T>(v: T | undefined | null, msg?: string): T {
  if (v == null) {
    throw new Error(msg ?? `Unexpected ${v} value`);
  }
  return v;
}
