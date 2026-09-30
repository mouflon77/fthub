// eslint-config-next ships native flat configs, so no eslintrc compat bridge.
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'scripts/**', 'screenshots/**'] },
  ...coreWebVitals,
  ...typescript,
  {
    // React Three Fiber drives the scene by mutating three.js objects inside
    // useFrame, which runs on the render loop rather than in React's render
    // phase. The compiler's immutability rule cannot see that distinction and
    // flags every camera and uniform write, so it is off for the scene only.
    files: ['components/garden/**'],
    rules: { 'react-hooks/immutability': 'off' },
  },
];

export default config;
