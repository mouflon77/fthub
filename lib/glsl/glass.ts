/**
 * Stylised ice glass. Refracted and reflected rays evaluate ftSky() so petals
 * bend the same arctic field the backdrop draws, with no transmission pass.
 */
export const glassGLSL = /* glsl */ `
vec3 ftGlass(
  vec3 N,
  vec3 V,
  vec3 tint,
  float ior,
  float density,
  float reflectance,
  float iridescence,
  float glow,
  out float alpha
) {
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 4.2);

  vec3 refl = reflect(-V, N);
  vec3 refr = refract(-V, N, 1.0 / max(ior, 1.001));
  if (dot(refr, refr) < 1.0e-6) refr = refl;

  float thickness = mix(1.0, 0.16, ndv);
  vec3 absorb = exp(-density * thickness * (1.0 - tint));

  vec3 col = mix(tint * 1.05, ftSky(refr) * absorb, 0.55);
  col = mix(col, ftSky(refl) * 1.1, clamp(fres * reflectance, 0.0, 1.0));

  col += tint * pow(1.0 - ndv, 1.6) * 0.22;
  col += tint * pow(max(dot(-N, FT_KEY_DIR), 0.0), 1.7) * 0.55;
  col += tint * vec3(1.0, 0.88, 0.72) * pow(max(dot(-N, FT_WARM_DIR), 0.0), 2.2) * 0.1;
  col += tint * pow(dot(N, FT_KEY_DIR) * 0.5 + 0.5, 2.2) * 0.22;

  vec3 film = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + thickness * 1.9 + ndv * 1.15));
  col += film * fres * iridescence * 0.4;

  vec3 h1 = normalize(FT_KEY_DIR + V);
  vec3 h2 = normalize(FT_WARM_DIR + V);
  col += vec3(0.85, 0.94, 1.0) * pow(max(dot(N, h1), 0.0), 110.0) * 1.8;
  col += vec3(1.0, 0.92, 0.8) * pow(max(dot(N, h2), 0.0), 80.0) * 0.28;

  col += tint * glow;

  alpha = clamp(0.62 + fres * 0.32 + glow * 0.85, 0.0, 1.0);
  return col;
}
`;
