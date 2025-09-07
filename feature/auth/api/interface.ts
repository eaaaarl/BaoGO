export interface SignUpPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface ProfileUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
}
