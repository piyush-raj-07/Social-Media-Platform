// all server urls come from client/.env (change only there when deploying)
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

// common part of every api url -> `${API_URL}/user/login`
export const API_URL = `${SERVER_URL}/api/v1`;
