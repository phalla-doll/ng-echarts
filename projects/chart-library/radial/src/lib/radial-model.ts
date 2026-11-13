export type RadialModel =
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'empty' }
  | {
      readonly kind: 'ready';
      readonly value: number;
      readonly max: number;
      readonly ratio: number;
    };

export function normalizeRadialProgress(value: number | null, max: number): RadialModel {
  if (typeof max !== 'number' || !Number.isFinite(max) || max <= 0)
    return { kind: 'error', message: 'Progress maximum must be a positive, finite number.' };
  if (value === null) return { kind: 'empty' };
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max)
    return { kind: 'error', message: 'Progress value must be between zero and its maximum.' };
  const normalized = value === 0 ? 0 : value;
  return { kind: 'ready', value: normalized, max, ratio: normalized / max };
}
