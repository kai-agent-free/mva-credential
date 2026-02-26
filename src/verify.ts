/**
 * MVA Credential Verification
 * Reference verifier implementation
 */

import { createSigningPayload } from './canonical';
import type { MVACredential } from './types';

export interface VerificationResult {
  valid: boolean;
  checks: {
    signature: boolean;
    scope_in_payload: boolean;
    action_audit: boolean;
    attestation_present: boolean;
    not_expired: boolean;
  };
  errors: string[];
}

/**
 * Verify an MVA Credential
 * 
 * @param credential - The credential to verify
 * @param verifySignature - Function to verify ed25519 signature (inject your crypto lib)
 */
export async function verifyCredential(
  credential: MVACredential,
  verifySignature: (pubkey: string, message: string, sig: string) => Promise<boolean>,
): Promise<VerificationResult> {
  const errors: string[] = [];
  const checks = {
    signature: false,
    scope_in_payload: false,
    action_audit: false,
    attestation_present: false,
    not_expired: false,
  };

  // 1. Verify passport signature over canonical payload
  try {
    const payload = createSigningPayload(credential);
    checks.signature = await verifySignature(
      credential.subject.passport_pubkey,
      payload,
      credential.passport_sig,
    );
    if (!checks.signature) errors.push('Invalid passport signature');
  } catch (e) {
    errors.push(`Signature verification failed: ${e}`);
  }

  // 2. Verify scope_hash is in signed payload (not just metadata)
  const payload = createSigningPayload(credential);
  checks.scope_in_payload = payload.includes(credential.task.scope_hash);
  if (!checks.scope_in_payload) {
    errors.push('scope_hash not found in signed payload — possible tampering');
  }

  // 3. Action audit: action_hashes present (non-empty = agent did something)
  checks.action_audit = credential.action_hashes.length > 0;
  if (!checks.action_audit) {
    errors.push('No action_hashes — cannot verify behavioral proof');
  }

  // 4. At least one attestation
  checks.attestation_present = credential.attestations.length > 0;
  if (!checks.attestation_present) {
    errors.push('No attestations — no social proof');
  }

  // 5. Delegation not expired (if present)
  if (credential.delegation_proof) {
    const expires = new Date(credential.delegation_proof.expires_at);
    checks.not_expired = expires > new Date();
    if (!checks.not_expired) {
      errors.push(`Delegation expired at ${credential.delegation_proof.expires_at}`);
    }
  } else {
    checks.not_expired = true; // No delegation = no expiry to check
  }

  return {
    valid: Object.values(checks).every(Boolean),
    checks,
    errors,
  };
}
