/**
 * MVA Credential Types
 * Minimum Viable Attestation for AI Agent Identity
 */

export interface MVACredential {
  version: '0.2';
  type: 'mva_credential';

  subject: {
    agent_id: string;          // AgentPass passport ID (e.g., "ap_a622a643aa71")
    passport_pubkey: string;   // ed25519 public key
  };

  task: {
    task_hash: string;         // sha256 of deliverable (= contract_id in ClawdVine)
    scope_hash: string;        // sha256 of granted scope (MUST be in signed payload)
    description?: string;
    contract_id?: string;      // ClawdVine interop
  };

  execution_context: {
    model_id?: string;         // e.g., "claude-3.5-sonnet"
    temperature?: number;
    system_prompt_hash?: string;
  };

  action_hashes: string[];     // sha256 of each action taken (auditable diff vs scope)

  attestations: Attestation[];

  delegation_proof?: DelegationProof;

  passport_sig: string;        // ed25519 sig over canonical signing payload
  created_at: string;          // ISO 8601
}

export interface Attestation {
  attester_id: string;         // e.g., "isnad:agent_b"
  attester_sig: string;        // ed25519 sig
  score?: number;              // 0-1 continuous (not binary)
  completion_ts: string;       // ISO 8601
}

export interface DelegationProof {
  delegator_id: string;        // who authorized this agent
  scope: string[];             // granted action types
  scope_hash: string;          // sha256 of scope array
  liability_weight?: number;   // 0-1, from macaroon model
  expires_at: string;
  delegator_sig: string;
}

/**
 * Canonical signing payload — sorted keys, no whitespace
 * This is what gets signed by passport_sig
 */
export interface SigningPayload {
  agent_id: string;
  task_hash: string;
  scope_hash: string;
  action_hashes: string[];
  model_id?: string;
  timestamp: string;
}
