export const FT_GUST_SLOTS = 4;

/**
 * The wind field. Every plant, blade and firefly samples this one function,
 * so the whole garden agrees about which way the air is moving.
 *
 * Three contributions:
 *   1. an ambient two-octave breeze, so nothing is ever perfectly still
 *   2. a swirl around the cursor — radial push plus tangential curl, dragged
 *      along by two differently lagged copies of the cursor velocity, which is
 *      what gives the motion its overshoot and settle
 *   3. expanding rings from clicks
 */
export const windGLSL = /* glsl */ `
#define FT_GUSTS ${FT_GUST_SLOTS}

uniform float uTime;
uniform vec3 uPointer;
uniform float uPointerAmp;
uniform vec2 uStroke;
uniform vec2 uStrokeSlow;
uniform float uBreeze;
uniform float uMotion;
uniform float uReach;
uniform vec4 uGusts[FT_GUSTS];

vec2 ftWindAt(vec3 base, float seed) {
  vec2 amb;
  amb.x = snoise(vec3(base.x * 0.15, base.z * 0.15, uTime * 0.10));
  amb.y = snoise(vec3(base.z * 0.13 + 31.7, base.x * 0.13, uTime * 0.082));
  amb += 0.42 * vec2(
    snoise(vec3(base.x * 0.44, base.z * 0.44, uTime * 0.27)),
    snoise(vec3(base.z * 0.41 + 7.1, base.x * 0.41, uTime * 0.24))
  );
  amb *= uBreeze;

  vec2 d = base.xz - uPointer.xz;
  float dist = length(d);
  vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0, 1.0);
  vec2 tangent = vec2(-dir.y, dir.x);
  float reach = exp(-dist * dist / max(uReach, 0.05));

  vec2 swirl = (dir * 0.5 + tangent * 0.8) * reach * uPointerAmp;
  swirl += (uStroke * 1.15 + uStrokeSlow * 0.85) * reach;

  vec2 gust = vec2(0.0);
  for (int i = 0; i < FT_GUSTS; i++) {
    vec4 g = uGusts[i];
    if (g.w < 0.0) continue;
    float age = uTime - g.w;
    if (age < 0.0 || age > 2.8) continue;
    vec2 gd = base.xz - g.xy;
    float gl = length(gd);
    float dr = gl - age * 5.4;
    float band = exp(-dr * dr * 1.9);
    gust += (gl > 1e-4 ? gd / gl : vec2(0.0)) * band * exp(-age * 1.45) * g.z;
  }

  return (amb + swirl + gust) * uMotion;
}

mat3 ftAxisRot(vec3 axis, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  float t = 1.0 - c;
  return mat3(
    t * axis.x * axis.x + c,
    t * axis.x * axis.y + s * axis.z,
    t * axis.x * axis.z - s * axis.y,
    t * axis.x * axis.y - s * axis.z,
    t * axis.y * axis.y + c,
    t * axis.y * axis.z + s * axis.x,
    t * axis.x * axis.z + s * axis.y,
    t * axis.y * axis.z - s * axis.x,
    t * axis.z * axis.z + c
  );
}

/**
 * Arc-bend a plant-local point around its own base. h is 0 at the ground and
 * 1 at the tip; angle grows with h squared so stems curve instead of shearing.
 * atan() saturates the response, so a fast cursor can never fold a plant flat.
 */
void ftBend(inout vec3 local, inout vec3 nrm, vec2 force, float h, float stiffness) {
  float amp = length(force);
  if (amp < 1e-5) return;
  vec2 dir = force / amp;
  float angle = atan(amp * 0.42 / max(stiffness, 0.25)) * h * h;
  mat3 rot = ftAxisRot(normalize(vec3(dir.y, 0.0, -dir.x)), angle);
  local = rot * local;
  nrm = normalize(rot * nrm);
}
`;
