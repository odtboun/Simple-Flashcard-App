-- Remove name column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS name;

-- Update the handle_new_user function to not use name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 