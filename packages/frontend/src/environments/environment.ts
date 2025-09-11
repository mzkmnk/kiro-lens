/**
 * 本番環境設定
 */
export const environment = {
  production: true,
  apiUrl: "http://localhost:3001",
  enableMSW: false,
  logLevel: "error" as const,
  version: "1.0.0",
};
