-- Drop the project_progress table since we're moving everything to quotes
DROP TABLE IF EXISTS public.project_progress CASCADE;

-- Add progress-related fields to the quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_notes TEXT,
ADD COLUMN IF NOT EXISTS milestone_date DATE,
ADD COLUMN IF NOT EXISTS house_length NUMERIC,
ADD COLUMN IF NOT EXISTS house_width NUMERIC,
ADD COLUMN IF NOT EXISTS house_height NUMERIC,
ADD COLUMN IF NOT EXISTS total_volume NUMERIC,
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'full_contract',
ADD COLUMN IF NOT EXISTS house_type TEXT,
ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS bathrooms INTEGER,
ADD COLUMN IF NOT EXISTS floors INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS plan_file_url TEXT;

-- Update the quotes table to ensure all necessary fields exist
ALTER TABLE public.quotes 
ALTER COLUMN progress_percentage SET DEFAULT 0,
ALTER COLUMN contract_type SET DEFAULT 'full_contract',
ALTER COLUMN floors SET DEFAULT 1;

-- Add a constraint to ensure progress percentage is between 0 and 100
ALTER TABLE public.quotes 
ADD CONSTRAINT progress_percentage_check 
CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Create user-specific pricing override tables for dynamic pricing system

-- User material price overrides
CREATE TABLE IF NOT EXISTS public.user_material_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.material_base_prices(id) ON DELETE CASCADE,
  custom_price BIGINT NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, material_id, region)
);

-- User labor rate overrides
CREATE TABLE IF NOT EXISTS public.user_labor_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  labor_type_id UUID REFERENCES public.labor_types(id) ON DELETE CASCADE,
  custom_rate BIGINT NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, labor_type_id, region)
);

-- User additional service price overrides
CREATE TABLE IF NOT EXISTS public.user_service_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.additional_services(id) ON DELETE CASCADE,
  custom_price BIGINT NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, service_id, region)
);

-- User equipment rate overrides
CREATE TABLE IF NOT EXISTS public.user_equipment_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.equipment_types(id) ON DELETE CASCADE,
  custom_rate BIGINT NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, equipment_id, region)
);

-- Room types for new room-based calculation system
CREATE TABLE IF NOT EXISTS public.room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  calculation_method TEXT NOT NULL DEFAULT 'volume', -- 'volume' or 'area'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Room material requirements
CREATE TABLE IF NOT EXISTS public.room_material_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id UUID REFERENCES public.room_types(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.material_base_prices(id) ON DELETE CASCADE,
  quantity_per_unit NUMERIC NOT NULL, -- quantity per m3 or m2 depending on calculation method
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(room_type_id, material_id)
);

-- Enable RLS on new tables
ALTER TABLE public.user_material_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_labor_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_service_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_equipment_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_material_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user override tables
CREATE POLICY "Users can manage their own material price overrides" ON public.user_material_prices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own labor rate overrides" ON public.user_labor_overrides
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own service price overrides" ON public.user_service_overrides
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own equipment rate overrides" ON public.user_equipment_overrides
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view room types" ON public.room_types
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage room types" ON public.room_types
  FOR ALL USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Anyone can view room material requirements" ON public.room_material_requirements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage room material requirements" ON public.room_material_requirements
  FOR ALL USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Add updated_at triggers for new tables
CREATE TRIGGER update_user_material_prices_updated_at
  BEFORE UPDATE ON public.user_material_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_labor_overrides_updated_at
  BEFORE UPDATE ON public.user_labor_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_service_overrides_updated_at
  BEFORE UPDATE ON public.user_service_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_equipment_overrides_updated_at
  BEFORE UPDATE ON public.user_equipment_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default room types
INSERT INTO public.room_types (name, calculation_method, description) VALUES
  ('Bedroom', 'volume', 'Standard bedroom with walls, flooring, and ceiling'),
  ('Bathroom', 'volume', 'Bathroom with plumbing, tiling, and fixtures'),
  ('Kitchen', 'volume', 'Kitchen with plumbing, electrical, and fixtures'),
  ('Living Room', 'volume', 'Living room with walls, flooring, and ceiling'),
  ('Dining Room', 'volume', 'Dining room with walls, flooring, and ceiling'),
  ('Garage', 'volume', 'Garage with basic construction'),
  ('Backyard', 'area', 'Open backyard area'),
  ('Patio', 'area', 'Covered patio area'),
  ('Balcony', 'area', 'Balcony area'),
  ('Office', 'volume', 'Home office with standard construction'),
  ('Storage Room', 'volume', 'Storage room with basic construction'),
  ('Pantry', 'volume', 'Pantry with shelving and storage')
ON CONFLICT (name) DO NOTHING;

-- Insert basic material requirements for room types
INSERT INTO public.room_material_requirements (room_type_id, material_id, quantity_per_unit)
SELECT 
  rt.id,
  mbp.id,
  CASE 
    WHEN rt.name IN ('Bedroom', 'Living Room', 'Dining Room', 'Office') AND mbp.name = 'Cement' THEN 0.5
    WHEN rt.name IN ('Bedroom', 'Living Room', 'Dining Room', 'Office') AND mbp.name = 'Bricks' THEN 100
    WHEN rt.name = 'Bathroom' AND mbp.name = 'Cement' THEN 0.8
    WHEN rt.name = 'Bathroom' AND mbp.name = 'Bricks' THEN 120
    WHEN rt.name = 'Kitchen' AND mbp.name = 'Cement' THEN 0.7
    WHEN rt.name = 'Kitchen' AND mbp.name = 'Bricks' THEN 110
    WHEN rt.calculation_method = 'area' AND mbp.name = 'Cement' THEN 0.1
    ELSE 50
  END
FROM public.room_types rt
CROSS JOIN public.material_base_prices mbp
WHERE mbp.name IN ('Cement', 'Bricks', 'Sand', 'Aggregate')
ON CONFLICT (room_type_id, material_id) DO NOTHING;