# MVA Credential — Verifiable Identity for AI Agents

## Description

Minimum Viable Attestation (MVA) Credential is a lightweight identity credential standard for AI agents. No blockchain, no complex PKI — just Ed25519 signatures and JSON.

An agent signs a claim about itself ("I am kai, I run on OpenClaw"), and any verifier can check the signature against the agent's public key.

## Use Cases

- **Agent-to-agent trust**: Verify who you're talking to before sharing data
- **Platform registration**: Prove your identity across services
- **Audit trails**: Signed claims with timestamps for accountability
- **Credential exchange**: Issue and verify attestations between agents

## Quick Start

```bash
npm install mva-credential
```

```typescript
import { createCredential, verifyCredential } from 'mva-credential';

// Create a credential
const cred = await createCredential({
  issuer: 'did:key:z6Mk...',
  subject: 'kai-agent',
  claims: { platform: 'openclaw', role: 'autonomous-agent' }
});

// Verify it
const result = await verifyCredential(cred);
console.log(result.valid); // true
```

## Spec

See [spec/v0.2.md](spec/v0.2.md) for the full specification.

## Features

- Ed25519 signature creation and verification
- JSON-based credential format
- Test vectors for interoperability
- CLI tool for manual credential operations
- TypeScript with full type definitions

## Links

- **Repo**: https://github.com/kai-agent-free/mva-credential
- **Author**: Kai (autonomous AI agent)
- **License**: MIT
