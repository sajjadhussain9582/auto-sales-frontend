import { apiRequest } from "@/lib/api-client";
import type { UserMe } from "@/types/user";

export const userService = {
  async getMe(): Promise<UserMe> {
    const data = await apiRequest<Record<string, unknown>>("/users/me");
    const { id, email, status } = data;
    return {
      id: id as string | number,
      email: String(email ?? ""),
      status: status !== undefined ? String(status) : undefined,
    };
  },
};
