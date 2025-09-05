export interface SignUpPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}
