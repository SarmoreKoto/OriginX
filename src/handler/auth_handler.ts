import { MetaApi } from "../config/metaApi";
import { apiHandler, ApiResponse } from "./api_handler";

// ✅ Strong typing
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role?: string;
}

interface LoginData {
  user: User;
  token: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<ApiResponse<LoginData>> => {
  const res = await apiHandler<LoginData>({
    url: MetaApi.login,
    method: "post",
    data: { email, password },
  });

  console.log("🔐 Login Response:", res);

  return res; // ✅ no localStorage here (keep logic clean)
};

export const logoutUser = () => {
  try {
    localStorage.clear();
    console.log("🚪 User logged out");

    return { ok: true };
  } catch (error: any) {
    console.error("❌ Logout Error:", error);

    return {
      ok: false,
      message: "Logout failed",
    };
  }
};