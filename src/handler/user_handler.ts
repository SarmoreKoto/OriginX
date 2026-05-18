import api from "../handler/api";

type RegisterResponse = {
  success: boolean;
  message: string;
  id?: string;
};

export const registerUser = async (userData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  status?: string;
  role?: string;
  avatar?: string;
}) => {
  try {
    const res = await api.post<RegisterResponse>("/api/users", {
      ...userData,
      status: userData.status || "active",
      role: userData.role || "User",
      avatar: userData.avatar || "",
    });

    return {
      ok: true,
      data: res.data,
    };
  } catch (error: any) {
    return {
      ok: false,
      data: {
        success: false,
        message: error?.response?.data?.message || error.message || "Registration failed",
      },
    };
  }
};

export const getUsers = async () => {
  const res = await api.get("/api/users");
  return res.data;
};

export const getUserById = async (id: string) => {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
};