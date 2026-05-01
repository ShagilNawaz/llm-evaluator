const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Centralized fetch wrapper with error normalization
 */
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  const res = await fetch(url, config);

  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errBody = await res.json();
      errorMessage = errBody.error || errBody.message || errorMessage;
    } catch (_) {
      // keep default message
    }
    const err = new Error(errorMessage);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// ── Generate ─────────────────────────────────────────────────────────────────

/**
 * Send a prompt to the backend; receive two Claude responses.
 * @param {string} prompt
 * @returns {Promise<{ responseA: string, responseB: string, prompt: string }>}
 */
export async function generateResponses(prompt) {
  return request('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

// ── Evaluations ───────────────────────────────────────────────────────────────

/**
 * Save a completed evaluation.
 * @param {Object} payload
 */
export async function saveEvaluation(payload) {
  return request('/api/evaluate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch paginated evaluations.
 * @param {{ page?: number, limit?: number }} params
 */
export async function fetchEvaluations({ page = 1, limit = 10 } = {}) {
  return request(`/api/evaluations?page=${page}&limit=${limit}`);
}

/**
 * Fetch aggregated analytics data.
 */
export async function fetchAnalytics() {
  return request('/api/evaluations/analytics');
}

/**
 * Export all evaluations as raw JSON download.
 */
export async function exportEvaluations() {
  const res = await fetch(`${API_BASE}/api/evaluations/export`);
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}
