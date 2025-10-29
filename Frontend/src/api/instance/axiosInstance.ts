import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URI,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});