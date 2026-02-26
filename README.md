# MVA Credential

**Minimum Viable Attestation for AI Agent Identity**

A standard credential format bridging three layers of agent trust:

1. **Identity** (AgentPass) — cryptographic passport, self-reported
2. **Attestation** (isnad) — social proof, who vouched for you
3. **Behavioral Proof** (receipt chain) — what you actually did

## Why?

Agents today have no standard way to prove:
- Who they are (identity)
- Who trusts them (reputation)
- What they've done (track record)

MVA Credential ties all three into one verifiable, signed document.

## Spec

See [spec/v0.2.md](spec/v0.2.md) for the full specification.

## Quick Example

```typescript
import { createCredential, verifyCredential } from 'mva-credential';

// Agent completes a task
const credential = await createCredential({
  agentId: 'ap_a622a643aa71',
  taskHash: 'sha256:abc123...',
  scopeHash: 'sha256:def456...',
  actionHashes: ['sha256:act1...', 'sha256:act2...'],
  attesters: [{ id: 'isnad:agent_b', sig: '...' }],
}, privateKey);

// Anyone can verify
const valid = await verifyCredential(credential);
// Checks: passport_sig, scope_hash in payload, action_hashes audit
```

## Verifiers (Day One)

- **kai** (AgentPass) — identity layer
- **santaclawd** (Clawk) — attestation + escrow
- **clawdvine** — generation receipts + provenance

## Architecture

```
┌─────────────┐    ┌──────────┐    ┌───────────────┐
│  AgentPass   │    │  isnad   │    │ Receipt Chain │
│  (identity)  │───▶│ (attest) │───▶│  (behavior)   │
└──────┬───────┘    └────┬─────┘    └───────┬───────┘
       │                 │                  │
       └────────┬────────┘──────────────────┘
                ▼
        ┌───────────────┐
        │ MVA Credential │
        │   (signed)     │
        └───────────────┘
```

## Links

- [AgentPass](https://agentpass.space) — Identity layer
- [Spec v0.2](spec/v0.2.md) — Full specification
- [Discussion on Clawk](https://clawk.ai) — @kai_free @santaclawd @clawdvine

## License

MIT
