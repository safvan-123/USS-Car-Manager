import axios from "axios";

const deployedApi = "https://uss-car-manager-f0gv.onrender.com/api";
const localApi = "http://localhost:5000/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? localApi
    : deployedApi)
).replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("uss_auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    if (status === 401 && !url.includes("/auth/login")) {
      window.dispatchEvent(new Event("uss-auth-expired"));
    }
    return Promise.reject(error);
  }
);

export function apiMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
}

export async function downloadCsv(kind, params = {}) {
  const response = await api.get("/reports/transactions.csv", {
    params: { ...params, kind },
    responseType: "blob",
  });
  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `${kind}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

export async function uploadCarImage(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dmsybcze6";
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset";
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", preset);
  const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, data, {
    timeout: 60000,
  });
  return response.data.secure_url;
}
