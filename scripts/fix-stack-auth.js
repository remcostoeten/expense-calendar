#!/usr/bin/env node

import { glob } from 'glob';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Find all @stackframe/stack-sc packages in node_modules
const stackScPaths = await glob('node_modules/.pnpm/@stackframe+stack-sc@*/node_modules/@stackframe/stack-sc/dist', {
  cwd: process.cwd(),
  absolute: true
});

console.log('Fixing Stack Auth build issues...');

for (const distPath of stackScPaths) {
  const workaroundPath = `${distPath}/next-static-analysis-workaround.js`;
  const typesPath = `${distPath}/next-static-analysis-workaround.d.ts`;
  
  // Create the directory if it doesn't exist
  mkdirSync(distPath, { recursive: true });
  
  // Create the workaround JavaScript file
  writeFileSync(workaroundPath, `// Stack Auth Next.js static analysis workaround
export function headers() {
  return new Headers();
}

export default function nextStaticAnalysisWorkaround() {
  return null;
}
`);

  // Create the TypeScript declaration file
  writeFileSync(typesPath, `// Stack Auth Next.js static analysis workaround types
export function headers(): Headers;
export default function nextStaticAnalysisWorkaround(): null;
`);

  console.log(`✓ Fixed Stack Auth in: ${distPath}`);
}

console.log('Stack Auth build fix completed!');
