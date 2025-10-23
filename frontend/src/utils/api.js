import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Auth endpoints
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

// Profile endpoints
export const saveUserProfile = (data) => {
  const token = localStorage.getItem("token");
  return API.post("/profile", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getUserProfile = () => {
  const token = localStorage.getItem("token");
  return API.get("/profile", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Mood endpoints
export const saveMoodEntry = (data) => {
  const token = localStorage.getItem("token");
  return API.post("/mood", data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};
