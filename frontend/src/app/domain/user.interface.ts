export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface LoginResponse {
  user: User;
  token: string;
  isNew: boolean;
}
