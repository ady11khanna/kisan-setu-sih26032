const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = {
  async fetchMandis() {
    try {
      const res = await fetch(`${API_BASE_URL}/mandis`);
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn("Express backend offline, fallback to local state:", e);
      return null;
    }
  },

  async fetchTokens() {
    try {
      const res = await fetch(`${API_BASE_URL}/tokens`);
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async fetchSmsLogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/sms/logs`);
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async bookSlot(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/slots/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async checkInToken(tokenId, counterAssigned) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, counterAssigned }),
      });
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async recordWeighment(tokenId, weighmentDetails) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/weighment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, ...weighmentDetails }),
      });
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  },

  async dispatchPayment(tokenId) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pfms-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });
      const json = await res.json();
      return json.data;
    } catch (e) {
      return null;
    }
  }
};
