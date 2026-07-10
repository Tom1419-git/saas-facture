-- ==========================================
-- SCHÉMA DE BASE DE DONNÉES - FACTURE ARTISAN
-- ==========================================

-- 1. Table Profiles (Liée à l'authentification Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  iban TEXT,
  is_pro BOOLEAN DEFAULT false,
  invoice_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Active la sécurité (RLS) sur les profils
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir et modifier uniquement leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur profil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Les utilisateurs peuvent modifier leur profil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger pour créer automatiquement un profil quand un compte est créé
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================

-- 2. Table Invoices (Historique des factures)
CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Active la sécurité (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs gèrent uniquement leurs factures
CREATE POLICY "Les utilisateurs voient leurs factures" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs créent leurs factures" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs suppriment leurs factures" ON public.invoices FOR DELETE USING (auth.uid() = user_id);
