export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  
  // Дополнительные поля из БД:
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  is_verified?: boolean;
  is_active?: boolean;
  last_login?: Date;
  subscription_expires_at?: Date;
  settings?: any;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  subscription_expires_at?: Date;
  settings?: any;
}

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
} 