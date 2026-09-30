/**
 * One analytic environment shared by the backdrop and every glass surface.
 * Ice field: pale zenith, glacier horizon, a cool key and a thin sun-on-ice
 * counter so the garden stays arctic rather than night.
 */
export const skyGLSL = /* glsl */ `
#define FT_KEY_DIR normalize(vec3(-0.48, 0.60, 0.64))
#define FT_WARM_DIR normalize(vec3(0.88, 0.18, 0.44))

vec3 ftSky(vec3 dir) {
  vec3 d = normalize(dir);
  float h = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);

  vec3 deep = vec3(0.42, 0.66, 0.82);
  vec3 horizon = vec3(0.74, 0.88, 0.96);
  vec3 zenith = vec3(0.90, 0.96, 1.0);

  vec3 col = mix(deep, horizon, smoothstep(0.12, 0.48, h));
  col = mix(col, zenith, smoothstep(0.48, 0.96, h));

  float key = max(dot(d, FT_KEY_DIR), 0.0);
  col += vec3(0.28, 0.55, 0.95) * pow(key, 6.0) * 0.16;
  col += vec3(0.92, 0.97, 1.0) * pow(key, 48.0) * 0.55;

  float warm = max(dot(d, FT_WARM_DIR), 0.0);
  col += vec3(1.0, 0.86, 0.7) * pow(warm, 10.0) * 0.05;
  col += vec3(1.0, 0.94, 0.82) * pow(warm, 60.0) * 0.18;

  col *= mix(1.0, 0.92, smoothstep(0.55, 0.95, h));

  return col;
}

vec3 ftHaze(vec3 col, float dist, vec3 viewDir) {
  float f = 1.0 - exp(-max(dist - 5.0, 0.0) * 0.048);
  return mix(col, ftSky(viewDir) * 1.04, clamp(f, 0.0, 1.0) * 0.9);
}
`;
