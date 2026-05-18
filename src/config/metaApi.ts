export class MetaApi {
  // ===== base url =====
  static baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // ===== auth =====
  static login = `${this.baseUrl}/api/auth/login`;

  // ===== users =====
  static users = `${this.baseUrl}/api/users`;
  static getUserById = (id: string) => `${this.baseUrl}/api/users/${id}`;

  // ===== databases =====
  static databases = `${this.baseUrl}/api/collections/databases`;
  static deleteDatabase = (dbName: string) => `${this.databases}/${dbName}`;

  // ===== collections =====
  static collections = `${this.baseUrl}/api/collections`;
  static getCollections = (dbName: string) => `${this.collections}/${dbName}`;
  static deleteCollection = (dbName: string, collectionName: string) =>
    `${this.collections}/${dbName}/${collectionName}`;

  // ===== documents =====
  static getDocuments = (dbName: string, collectionName: string) =>
    `${this.collections}/${dbName}/${collectionName}/documents`;
  static insertDocument = (dbName: string, collectionName: string) =>
    `${this.collections}/${dbName}/${collectionName}/documents`;
  static updateDocument = (dbName: string, collectionName: string, documentId: string) =>
    `${this.collections}/${dbName}/${collectionName}/documents/${documentId}`;
  static deleteDocument = (dbName: string, collectionName: string, documentId: string) =>
    `${this.collections}/${dbName}/${collectionName}/documents/${documentId}`;
}