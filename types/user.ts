/** Safe subset of `/users/me` — never surface password/hash in UI */
export type UserMe = {
  id: number | string;
  email: string;
  status?: string;
};
