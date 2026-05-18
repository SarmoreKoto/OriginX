import { MetaApi } from "../config/metaApi";
import { apiHandler } from "./api_handler";

// ===============================
// ✅ GET DATABASES
// ===============================
export const getDatabases = async () => {
  try {
    const res = await apiHandler({
      url: MetaApi.databases,
    });

    console.log("📦 Databases Response:", res);

    return res;
  } catch (error: any) {
    console.error("❌ getDatabases Error:", error);

    return {
      ok: false,
      data: {
        success: false,
        message: error.message || "Failed to fetch databases",
      },
    };
  }
};

// ===============================
// ✅ GET COLLECTIONS
// ===============================
export const getCollections = async (dbName: string) => {
  try {
    const res = await apiHandler({
      url: MetaApi.getCollections(dbName),
    });

    console.log(`📂 Collections (${dbName}):`, res);

    return res;
  } catch (error: any) {
    console.error("❌ getCollections Error:", error);

    return {
      ok: false,
      data: {
        success: false,
        message: error.message || "Failed to fetch collections",
      },
    };
  }
};

// ===============================
// ✅ GET DOCUMENTS
// ===============================
export const getDocuments = async (dbName: string, collectionName: string) => {
  try {
    const res = await apiHandler({
      url: MetaApi.getDocuments(dbName, collectionName),
      method: "get",
    });

    console.log(`📄 Documents (${dbName}/${collectionName}):`, res);

    return res;
  } catch (error: any) {
    console.error("❌ getDocuments Error:", error);

    return {
      ok: false,
      data: {
        success: false,
        message: error.message || "Failed to fetch documents",
      },
    };
  }
};

// ===============================
// ✅ CREATE COLLECTION
// ===============================
export const createCollection = async (
  dbName: string,
  collectionName: string
) => {
  try {
    const res = await apiHandler({
      url: MetaApi.getCollections(dbName),
      method: "post",
      data: { collectionName },
    });

    console.log(`➕ Create Collection (${dbName}/${collectionName}):`, res);

    return res;
  } catch (error: any) {
    console.error("❌ createCollection Error:", error);

    return {
      ok: false,
      data: {
        success: false,
        message: error.message || "Failed to create collection",
      },
    };
  }
};

// ===============================
// ❌ DELETE COLLECTION
// ===============================
export const deleteCollection = async (
  dbName: string,
  collectionName: string
) => {
  try {
    const res = await apiHandler({
      url: MetaApi.deleteCollection(dbName, collectionName),
      method: "delete",
    });

    console.log(`🗑️ Delete Collection (${dbName}/${collectionName}):`, res);

    return res;
  } catch (error: any) {
    console.error("❌ deleteCollection Error:", error);

    return {
      ok: false,
      data: {
        success: false,
        message: error.message || "Failed to delete collection",
      },
    };
  }
};