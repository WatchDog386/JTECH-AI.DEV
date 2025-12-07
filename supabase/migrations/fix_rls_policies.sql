
-- Fix the infinite recursion in RLS policies
-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all quotes" ON public.quotes;

-- Create a simpler admin policy that doesn't cause recursion
-- Instead of checking the profiles table, we'll use a function that directly checks auth metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_admin BOOLEAN := false;
BEGIN
  -- Check if user exists and is admin using a direct query
  SELECT is_admin INTO user_admin
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_admin, false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Recreate admin policies without recursion
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR 
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.is_admin = true
        LIMIT 1
      )
    )
  );

CREATE POLICY "Admins can view all quotes" ON public.quotes
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
      LIMIT 1
    )
  );
