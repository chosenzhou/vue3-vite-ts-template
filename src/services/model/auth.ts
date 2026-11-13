import type { UserProfile } from './user';

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: UserProfile
}
