// Stack Auth Next.js static analysis workaround
// This file is tracked in git and provides the missing module for Stack Auth builds

export function headers() {
  return new Headers();
}

export default function nextStaticAnalysisWorkaround() {
  return null;
}
