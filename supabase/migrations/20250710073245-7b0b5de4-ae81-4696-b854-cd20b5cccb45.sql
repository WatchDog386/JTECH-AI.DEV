
-- Create table for material base prices (admin controlled)
CREATE TABLE IF NOT EXISTS public.material_base_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'unit',
  base_price BIGINT NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for regional multipliers (admin controlled)
CREATE TABLE IF NOT EXISTS public.regional_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL UNIQUE,
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for client reviews
CREATE TABLE IF NOT EXISTS public.client_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  project_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for calendar events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.material_base_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for material_base_prices
CREATE POLICY "Anyone can view material base prices" ON public.material_base_prices
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify material base prices" ON public.material_base_prices
  FOR ALL USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for regional_multipliers
CREATE POLICY "Anyone can view regional multipliers" ON public.regional_multipliers
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify regional multipliers" ON public.regional_multipliers
  FOR ALL USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for client_reviews
CREATE POLICY "Users can view reviews for their quotes" ON public.client_reviews
  FOR SELECT USING (
    quote_id IN (SELECT id FROM public.quotes WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can insert reviews" ON public.client_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all reviews" ON public.client_reviews
  FOR SELECT USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for calendar_events
CREATE POLICY "Users can manage their own calendar events" ON public.calendar_events
  FOR ALL USING (auth.uid() = user_id);

-- Insert some default material base prices
INSERT INTO public.material_base_prices (name, unit, base_price, category, description) VALUES
  ('Cement', 'bag', 150000, 'building_materials', 'Standard cement bag (50kg)'),
  ('Steel Bars', 'ton', 8500000, 'building_materials', 'Reinforcement steel bars'),
  ('Bricks', 'piece', 1500, 'building_materials', 'Standard clay bricks'),
  ('Sand', 'cubic_meter', 300000, 'building_materials', 'Fine construction sand'),
  ('Aggregate', 'cubic_meter', 350000, 'building_materials', 'Coarse aggregate stones')
ON CONFLICT DO NOTHING;

-- Insert default regional multipliers
INSERT INTO public.regional_multipliers (region, multiplier) VALUES
  ('Nairobi', 1.20),
  ('Mombasa', 1.15),
  ('Kisumu', 1.10),
  ('Nakuru', 1.05),
  ('Eldoret', 1.00),
  ('Thika', 1.08),
  ('Machakos', 1.03)
ON CONFLICT (region) DO NOTHING;

-- Create function to send review email (placeholder)
CREATE OR REPLACE FUNCTION public.send_review_email(
  p_quote_id UUID,
  p_client_email TEXT,
  p_client_name TEXT
) RETURNS VOID AS $$
BEGIN
  -- This will be implemented as an edge function
  -- For now, just log the request
  RAISE NOTICE 'Review email requested for quote: %, client: %', p_quote_id, p_client_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send review email when project is completed
CREATE OR REPLACE FUNCTION public.handle_project_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Send review email
    PERFORM public.send_review_email(NEW.id, NEW.client_email, NEW.client_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_completion
  AFTER UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_project_completion();

-- Add updated_at trigger for new tables
CREATE TRIGGER update_material_base_prices_updated_at
  BEFORE UPDATE ON public.material_base_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regional_multipliers_updated_at
  BEFORE UPDATE ON public.regional_multipliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
