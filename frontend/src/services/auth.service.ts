import apiClient from "@/lib/axios";
import { AuthTokens, User } from "@/types";

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>("/auth/login/", { email, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout/", { refresh: refreshToken });
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me/");
    return data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post("/auth/reset-password/", { email });
  },

  async confirmPasswordReset(token: string, new_password: string, confirm_password: string): Promise<void> {
    await apiClient.post("/auth/reset-password/confirm/", { token, new_password, confirm_password });
  },

  async changePassword(old_password: string, new_password: string, confirm_new_password: string): Promise<void> {
    await apiClient.post("/users/change_password/", { old_password, new_password, confirm_new_password });
  },
};
