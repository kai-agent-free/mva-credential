# MVA Credential → W3C VC v2 Mapping

## Overview

This document defines how MVA Credentials map to W3C Verifiable Credentials Data Model v2.0,
enabling interoperability with AGNTCY Identity Service Agent Badges and other VC-based systems.

## W3C VC v2 Representation

An MVA Credential expressed as a W3C VC v2:

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://agentpass.space/ns/mva/v1"
  ],
  "type": ["VerifiableCredential", "MVACredential"],
  "id": "urn:mva:sha256:<credential_hash>",
  "issuer": "did:key:<agentpass_passport_pubkey>",
  "validFrom": "2026-03-31T06:00:00Z",
  "validUntil": "2026-06-30T06:00:00Z",
  "credentialSubject": {
    "id": "did:agentpass:ap_a622a643aa71",
    "type": "AgentAttestation",
    "task": {
      "hash": "sha256:abc123...",
      "scope": "code_review",
      "description": "Review PR #42 in repo X"
    },
    "attestation": {
      "attester": "did:agentpass:ap_attester_id",
      "score": 0.92,
      "completedAt": "2026-03-31T06:00:00Z"
    },
    "delegation": {
      "delegator": "did:agentpass:ap_delegator_id",
      "scope": ["code_review", "escrow_release"],
      "expires": "2026-04-01T00:00:00Z"
    }
  },
  "credentialSchema": {
    "id": "https://agentpass.space/schemas/mva-v1.json",
    "type": "JsonSchema"
  },
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-jcs-2022",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:key:<passport_pubkey>#key-1",
    "proofValue": "z..."
  }
}
```

## Field Mapping

| MVA v0.2 Field | W3C VC v2 Field | Notes |
|---|---|---|
| `version` | `@context` | Context URL includes version |
| `type: "mva_credential"` | `type: ["VerifiableCredential", "MVACredential"]` | Standard VC typing |
| `subject.agent_id` | `credentialSubject.id` | As `did:agentpass:<id>` |
| `subject.passport_pubkey` | `issuer` | As `did:key:<pubkey>` |
| `task.task_hash` | `credentialSubject.task.hash` | Unchanged |
| `task.scope` | `credentialSubject.task.scope` | Unchanged |
| `attestation.attester_id` | `credentialSubject.attestation.attester` | As DID |
| `attestation.attester_sig` | Embedded in `proof` or secondary proof | Multi-proof VC |
| `attestation.score` | `credentialSubject.attestation.score` | Unchanged |
| `delegation_proof.*` | `credentialSubject.delegation.*` | Structured claim |
| `passport_sig` | `proof.proofValue` | DataIntegrityProof |
| `created_at` | `validFrom` | W3C VC v2 naming |

## AGNTCY Agent Badge Compatibility

To be used as an AGNTCY Agent Badge:

1. **Content Type**: `CREDENTIAL_CONTENT_TYPE_AGENT_BADGE`
2. **Envelope Type**: `CREDENTIAL_ENVELOPE_TYPE_EMBEDDED_PROOF` (DataIntegrityProof) or `CREDENTIAL_ENVELOPE_TYPE_JOSE` (JWT)
3. **credentialSubject** must include the agent's AGNTCY ID if registered
4. **credentialSchema** should reference the published JSON Schema

### Publishing to AGNTCY Identity Service

```
POST /api/v1/verifiable-credentials
Content-Type: application/vc

{
  "credential_content": {
    "content_type": "CREDENTIAL_CONTENT_TYPE_AGENT_BADGE",
    "content": { <W3C VC JSON above> }
  },
  "envelope_type": "CREDENTIAL_ENVELOPE_TYPE_EMBEDDED_PROOF"
}
```

## DID Methods

MVA supports multiple DID methods for agent identification:

| Context | DID Method | Example |
|---|---|---|
| AgentPass passport | `did:key` | `did:key:z6Mk...` (Ed25519) |
| AgentPass agent ID | `did:agentpass` | `did:agentpass:ap_a622a643aa71` |
| Solana wallet | `did:sol` | `did:sol:7xKX...` |
| AGNTCY registered | `did:agntcy` | `did:agntcy:<uuid>` |

## Conversion Functions

### MVA v0.2 → W3C VC v2

```typescript
import type { MVACredential } from './types';
import type { VerifiableCredential } from './w3c-vc';

export function mvaToW3CVC(mva: MVACredential): VerifiableCredential {
  return {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://agentpass.space/ns/mva/v1',
    ],
    type: ['VerifiableCredential', 'MVACredential'],
    id: `urn:mva:${mva.task?.task_hash || 'unknown'}`,
    issuer: `did:key:${mva.subject.passport_pubkey}`,
    validFrom: mva.created_at,
    credentialSubject: {
      id: `did:agentpass:${mva.subject.agent_id}`,
      type: 'AgentAttestation',
      task: mva.task ? {
        hash: mva.task.task_hash,
        scope: mva.task.scope,
        description: mva.task.description,
      } : undefined,
      attestation: mva.attestation ? {
        attester: `did:agentpass:${mva.attestation.attester_id}`,
        score: mva.attestation.score,
        completedAt: mva.attestation.completion_ts,
      } : undefined,
      delegation: mva.delegation_proof ? {
        delegator: `did:agentpass:${mva.delegation_proof.delegator_id}`,
        scope: mva.delegation_proof.scope,
        expires: mva.delegation_proof.expires_at,
      } : undefined,
    },
    proof: {
      type: 'DataIntegrityProof',
      cryptosuite: 'eddsa-jcs-2022',
      proofPurpose: 'assertionMethod',
      verificationMethod: `did:key:${mva.subject.passport_pubkey}#key-1`,
      proofValue: mva.passport_sig,
    },
  };
}
```

## Status

- [x] Spec mapping defined
- [ ] TypeScript conversion functions implemented
- [ ] JSON Schema for MVACredential VC published
- [ ] Test vectors with AGNTCY Identity Service
- [ ] Integration test with `solana-agent-identity` plugin
