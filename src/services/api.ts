const API = {
  async get(url: string) {
    const token = localStorage.getItem("token");

    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async post(url: string, body: any) {
    const token = localStorage.getItem("token");

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  },
};

export default API;