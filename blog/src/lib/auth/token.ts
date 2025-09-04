import { httpClient } from "../api/http";

// With httpOnly cookies, we don't need to store tokens in memory
// The browser automatically sends cookies with requests

export const setAccessToken = (token: string | null): void => {
  // No-op: tokens are now stored in httpOnly cookies
  // This function is kept for compatibility but doesn't do anything
};

export const getAccessToken = (): string | null => {
  // No-op: we can't access httpOnly cookies from JavaScript
  // This function is kept for compatibility but always returns null
  return null;
};

export const clearAccessToken = (): void => {
  // No-op: cookies are cleared by the server on logout
  // This function is kept for compatibility but doesn't do anything
};

export const refreshAccessToken = async (): Promise<{
  accessToken: string;
}> => {
  try {
    // The server will automatically set new cookies
    // const response = await httpClient.post("/auth/refresh") as { success: boolean };
    return { accessToken: "httpOnly" }; // Dummy return for compatibility
  } catch (error) {
    throw error;
  }
};
