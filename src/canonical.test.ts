/**
 * Canonical JSON test vectors
 * Ensures cross-runtime deterministic serialization
 * 
 * Rule: numbers MUST be serialized as integers where possible.
 * Floats use JSON standard (no trailing zeros, no scientific notation for small numbers).
 * All implementations MUST produce identical output for these vectors.
 */

import { canonicalize } from './canonical';

// Test vectors for cross-verifier compatibility
const vectors = [
  {
    name: 'basic key ordering',
    input: { zebra: 1, alpha: 2, middle: 3 },
    expected: '{"alpha":2,"middle":3,"zebra":1}',
  },
  {
    name: 'nested objects',
    input: { b: { d: 1, c: 2 }, a: 3 },
    expected: '{"a":3,"b":{"c":2,"d":1}}',
  },
  {
    name: 'number serialization - integers',
    input: { score: 1, count: 0, negative: -1 },
    expected: '{"count":0,"negative":-1,"score":1}',
  },
  {
    name: 'number serialization - floats',
    input: { score: 0.92, weight: 0.5 },
    expected: '{"score":0.92,"weight":0.5}',
  },
  {
    name: 'arrays preserved order',
    input: { hashes: ['c', 'a', 'b'] },
    expected: '{"hashes":["c","a","b"]}',
  },
  {
    name: 'null values',
    input: { a: null, b: 1 },
    expected: '{"a":null,"b":1}',
  },
  {
    name: 'MVA signing payload',
    input: {
      agent_id: 'ap_test123',
      task_hash: 'sha256:abc',
      scope_hash: 'sha256:def',
      action_hashes: ['sha256:act1', 'sha256:act2'],
      timestamp: '2026-02-26T10:00:00Z',
    },
    expected: '{"action_hashes":["sha256:act1","sha256:act2"],"agent_id":"ap_test123","scope_hash":"sha256:def","task_hash":"sha256:abc","timestamp":"2026-02-26T10:00:00Z"}',
  },
];

// Run tests
let passed = 0;
for (const v of vectors) {
  const result = canonicalize(v.input);
  if (result === v.expected) {
    console.log(`✅ ${v.name}`);
    passed++;
  } else {
    console.log(`❌ ${v.name}`);
    console.log(`   expected: ${v.expected}`);
    console.log(`   got:      ${result}`);
  }
}
console.log(`\n${passed}/${vectors.length} vectors passed`);
