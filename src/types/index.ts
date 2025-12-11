// API Response types
export interface LoginResponse {
  token: string;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
}

// JWT Payload type
export interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  roles?: string[];
}
