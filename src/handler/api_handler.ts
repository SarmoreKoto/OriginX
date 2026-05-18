import api from "./api";

type ApiMethod = "get" | "post" | "patch" | "delete" | "put";

interface ApiOptions {
  url: string;
  method?: ApiMethod;
  data?: any;
  params?: any;
}

// ✅ Generic API Response Type
export interface ApiResponse<T = any> {
  ok: boolean;
  data: T | null;
  message: string;
  success: boolean;
}
export const apiHandler = async <T = any>({
  url,
  method = "get",
  data,
  params,
}: ApiOptions): Promise<ApiResponse<T>> => {
  try {
    let response;

    switch (method) {
      case "get":
        response = await api.get(url, { params });
        break;

      case "post":
        response = await api.post(url, data);
        break;

      case "patch":
        response = await api.patch(url, data);
        break;

      case "delete":
        response = await api.delete(url);
        break;

      case "put":
        response = await api.put(url, data); // ✅ fixed
        break;

      default:
        throw new Error("Invalid API method");
    }

    const resData = response.data;
    const normalized = resData.data ?? resData;

    return {
      ok: true,
      data: normalized,
      message: resData.message || "Success",
      success: resData.success ?? true,
    };
  } catch (error: any) {
    console.error("❌ API Handler Error:", error);

    return {
      ok: false,
      data: null,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
      success: false,
    };
  }
};