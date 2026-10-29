export const UNIT = {
  radius: 60,
  stroke: 24,
} as const;

const HALF = UNIT.stroke / 2;

export const num = (value: number): string => {
  const text = value.toFixed(2).replace(/\.?0+$/u, '');

  return text === '-0' ? '0' : text;
};

type Point = readonly [number, number];

const polar = (center: Point, radius: number, degrees: number): Point => {
  const angle = (degrees * Math.PI) / 180;

  return [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
};

const at = (point: Point) => `${num(point[0])} ${num(point[1])}`;

export type Shape = { readonly d: string; readonly width: number; readonly height: number };

export const gapRing = (gapStart: number, gapEnd: number): Shape => {
  const size = 2 * (UNIT.radius + HALF);
  const center: Point = [size / 2, size / 2];
  const outer = UNIT.radius + HALF;
  const inner = UNIT.radius - HALF;
  const sweep = 360 - (gapEnd - gapStart);
  const large = sweep > 180 ? 1 : 0;
  const d = [
    `M${at(polar(center, outer, gapEnd))}`,
    `A${outer} ${outer} 0 ${large} 1 ${at(polar(center, outer, gapStart + 360))}`,
    `A${HALF} ${HALF} 0 0 1 ${at(polar(center, inner, gapStart + 360))}`,
    `A${inner} ${inner} 0 ${large} 0 ${at(polar(center, inner, gapEnd))}`,
    `A${HALF} ${HALF} 0 0 1 ${at(polar(center, outer, gapEnd))}`,
    'Z',
  ].join(' ');

  return { d, width: size, height: size };
};

export const dot = (center: Point, radius: number): string =>
  `M${num(center[0] - radius)} ${num(center[1])} a${num(radius)} ${num(radius)} 0 1 0 ${num(2 * radius)} 0 a${num(radius)} ${num(radius)} 0 1 0 ${num(-2 * radius)} 0 Z`;

export const ring = (center: Point): string => {
  const outer = UNIT.radius + HALF;
  const inner = UNIT.radius - HALF;

  return `${dot(center, outer)} ${dot(center, inner).replace(/a(\S+) (\S+) 0 1 0/gu, 'a$1 $2 0 1 1')}`;
};

export const orbit = (): Shape => {
  const base = gapRing(-62, -28);
  const center: Point = [base.width / 2, base.height / 2];
  const end = polar(center, UNIT.radius, -28);
  const satellite = polar(center, UNIT.radius + UNIT.stroke * 1.15, -45);

  return {
    d: `${base.d} ${dot(satellite, HALF * 1.05)}`,
    width: base.width + UNIT.stroke * 0.9,
    height: base.height,
  };
};

export const pair = (): Shape => {
  const c = gapRing(-40, 40);
  const shiftX = c.width + UNIT.stroke * 0.6;
  const zeroCenter: Point = [shiftX + c.width / 2, c.height / 2];

  return { d: `${c.d} ${ring(zeroCenter)}`, width: shiftX + c.width, height: c.height };
};

export const notch = (): Shape => gapRing(-58, -32);
