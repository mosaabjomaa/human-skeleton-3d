// Shared source bounds keep the skeleton and cardiovascular assets registered.
const sourceBounds = {
  min: [-0.3346245885, 0.0092033008, -0.1128235608],
  max: [0.3346251249, 1.7054077387, 0.1373080015],
} as const;

export const anatomyScale = 3.1 / (sourceBounds.max[1] - sourceBounds.min[1]);
const anatomyOrigin = [
  (sourceBounds.min[0] + sourceBounds.max[0]) / 2,
  sourceBounds.min[1],
  (sourceBounds.min[2] + sourceBounds.max[2]) / 2,
] as const;

export const anatomyPosition = anatomyOrigin.map(
  (coordinate) => -coordinate * anatomyScale,
) as [number, number, number];

export const anatomyNormalization = {
  scale: anatomyScale,
  origin: anatomyOrigin,
};
