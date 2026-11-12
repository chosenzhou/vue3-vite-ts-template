export interface AuthEntryRequest {
  redirect: string
}

export interface AuthEntryResponse {
  authorizationUrl: string
}

export interface AuthResponse {
  token: string
  user: UserProfile
}

export interface UserProfile {
  id: string
  displayName: string
  avatar?: string
  email?: string
  provider: 'wecom'
}
