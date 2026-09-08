// Doit rester synchronisé avec l'enum public.app_role défini dans supabase/schema.sql.
export const APP_ROLES = ["parent", "moniteur", "accueil", "responsable", "administrateur"] as const;
export type AppRole = (typeof APP_ROLES)[number];
