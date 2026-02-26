/**
 * Canonical JSON serialization for MVA Credential signing
 * Rules: sorted keys, no whitespace, deterministic output
 */

export function canonicalize(obj: Record<string, unknown>): string {
  return JSON.stringify(sortKeys(obj));
}

function sortKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

/**
 * Create the canonical signing payload from a credential
 */
export function createSigningPayload(credential: {
  subject: { agent_id: string };
  task: { task_hash: string; scope_hash: string };
  action_hashes: string[];
  execution_context?: { model_id?: string };
  created_at: string;
}): string {
  const payload: Record<string, unknown> = {
    agent_id: credential.subject.agent_id,
    task_hash: credential.task.task_hash,
    scope_hash: credential.task.scope_hash,
    action_hashes: credential.action_hashes,
    timestamp: credential.created_at,
  };

  if (credential.execution_context?.model_id) {
    payload.model_id = credential.execution_context.model_id;
  }

  return canonicalize(payload);
}
