import axios from "axios";

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 20000,
});

// ---------------------------------------
// Add authentication token to requests
// ---------------------------------------

apiClient.interceptors.request.use(
  (config) => {
    if (
      typeof window !== "undefined"
    ) {
      const localToken =
        localStorage.getItem(
          "vendorhub_token"
        );

      const sessionToken =
        sessionStorage.getItem(
          "vendorhub_token"
        );

      const token =
        localToken || sessionToken;

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;