export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone?: string | null;
  app_profile?: 'CLIENT' | 'DELIVERY' | 'BOTH' | null;
  profile_complete?: boolean;
  created_at: string;
  avatar_url?: string | null;
  global_role: "SUPER_ADMIN" | "USER";
};
