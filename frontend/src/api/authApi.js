const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function handleResponse(res) {
  if (!res.ok) {
    let detail = 'Request failed.';
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore parse errors, keep default message
    }
    throw new Error(detail);
  }
  return res.json();
}

/**
 * Persist the chosen role + profile fields for a just-created Firebase user.
 * Must be called with a fresh ID token right after createUserWithEmailAndPassword.
 */
export async function registerProfile(idToken, profile) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(profile),
  });
  return handleResponse(res);
}

/** Fetch the logged-in user's role + profile. */
export async function fetchMyProfile(idToken) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  return handleResponse(res);
}
