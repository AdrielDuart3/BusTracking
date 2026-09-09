
-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- LINES
CREATE TABLE public.lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  frequency_min int NOT NULL DEFAULT 15,
  status text NOT NULL DEFAULT 'Operando',
  color text NOT NULL DEFAULT '#1d4ed8',
  estimated_minutes int NOT NULL DEFAULT 40,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lines TO anon, authenticated;
GRANT ALL ON public.lines TO service_role;
ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lines public read" ON public.lines FOR SELECT TO anon, authenticated USING (true);

-- STOPS
CREATE TABLE public.stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  address text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stops TO anon, authenticated;
GRANT ALL ON public.stops TO service_role;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stops public read" ON public.stops FOR SELECT TO anon, authenticated USING (true);

-- LINE_STOPS
CREATE TABLE public.line_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id uuid NOT NULL REFERENCES public.lines(id) ON DELETE CASCADE,
  stop_id uuid NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  position int NOT NULL,
  UNIQUE (line_id, position)
);
GRANT SELECT ON public.line_stops TO anon, authenticated;
GRANT ALL ON public.line_stops TO service_role;
ALTER TABLE public.line_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "line_stops public read" ON public.line_stops FOR SELECT TO anon, authenticated USING (true);

-- SCHEDULES
CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id uuid NOT NULL REFERENCES public.lines(id) ON DELETE CASCADE,
  departure_time time NOT NULL,
  direction text NOT NULL,
  weekday text NOT NULL DEFAULT 'util'
);
GRANT SELECT ON public.schedules TO anon, authenticated;
GRANT ALL ON public.schedules TO service_role;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules public read" ON public.schedules FOR SELECT TO anon, authenticated USING (true);

-- BUSES
CREATE TABLE public.buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  line_id uuid NOT NULL REFERENCES public.lines(id) ON DELETE CASCADE,
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'Em movimento',
  speed_kmh int NOT NULL DEFAULT 0,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.buses TO anon, authenticated;
GRANT ALL ON public.buses TO service_role;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buses public read" ON public.buses FOR SELECT TO anon, authenticated USING (true);

-- BUS LOCATIONS
CREATE TABLE public.bus_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  speed_kmh int NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bus_locations TO anon, authenticated;
GRANT ALL ON public.bus_locations TO service_role;
ALTER TABLE public.bus_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bus_locations public read" ON public.bus_locations FOR SELECT TO anon, authenticated USING (true);

-- FAVORITES
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('line','bus','stop')),
  item_id uuid NOT NULL,
  label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.favorites FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ================= SEED (cidade ficticia Nova Aurora) =================
INSERT INTO public.stops (code, name, address, lat, lng) VALUES
('P01','Terminal Central','Praça das Bandeiras, s/n - Centro', -23.2000, -46.5600),
('P02','Praça da Matriz','Rua Sete de Abril, 120 - Centro', -23.2035, -46.5555),
('P03','Mercado Municipal','Av. das Palmeiras, 340 - Centro', -23.2070, -46.5510),
('P04','Hospital Nova Aurora','Av. das Palmeiras, 1200 - Santa Luzia', -23.2105, -46.5465),
('P05','Escola Estadual Aurora','Rua dos Ipês, 45 - Santa Luzia', -23.2140, -46.5420),
('P06','Parque das Águas','Av. do Lago, 900 - Jardim Europa', -23.2175, -46.5375),
('P07','Shopping Aurora','Av. do Lago, 2100 - Jardim Europa', -23.2210, -46.5330),
('P08','Jardim Europa','Rua das Acácias, 77 - Jardim Europa', -23.2245, -46.5285),
('P09','Rodoviária Norte','Av. Norte, 15 - Vila Nova', -23.1950, -46.5480),
('P10','Vila Nova','Rua Bela Vista, 210 - Vila Nova', -23.1985, -46.5435),
('P11','Universidade Aurora','Av. do Saber, 500 - Universitário', -23.2020, -46.5390),
('P12','Biblioteca Municipal','Av. do Saber, 830 - Universitário', -23.2055, -46.5345),
('P13','Centro Esportivo','Rua do Estádio, 60 - Bela Vista', -23.2090, -46.5300),
('P14','Bela Vista','Rua das Palmas, 410 - Bela Vista', -23.2125, -46.5255),
('P15','Distrito Industrial','Rod. Aurora, km 4 - Industrial', -23.2160, -46.5210),
('P16','Portal Sul','Av. Sul, 1000 - Portal Sul', -23.2195, -46.5165),
('P17','Feira do Bairro','Rua da Feira, 33 - São Judas', -23.1915, -46.5620),
('P18','São Judas','Rua Boa Esperança, 500 - São Judas', -23.1880, -46.5570),
('P19','Morro Azul','Estrada do Morro, km 2 - Morro Azul', -23.1845, -46.5520),
('P20','Aeroporto Regional','Rod. Aurora, km 12 - Aeroporto', -23.1810, -46.5470);

INSERT INTO public.lines (code, name, origin, destination, start_time, end_time, frequency_min, status, color, estimated_minutes) VALUES
('101','Centro - Jardim Europa','Centro','Jardim Europa','05:30','23:30',15,'Operando','#1d4ed8',45),
('202','Vila Nova - Bela Vista','Vila Nova','Bela Vista','05:00','23:00',20,'Operando','#0891b2',38),
('303','Universitário - Portal Sul','Universitário','Portal Sul','05:45','22:45',25,'Operando','#16a34a',42),
('404','Bela Vista - Aeroporto','Bela Vista','Aeroporto Regional','04:50','23:50',30,'Operando','#ea580c',55),
('505','Circular Nova Aurora','Terminal Central','Terminal Central','05:15','22:15',18,'Parcial','#7c3aed',60);

INSERT INTO public.line_stops (line_id, stop_id, position)
SELECT l.id, s.id, x.position FROM (VALUES
('101','P01',1),('101','P02',2),('101','P03',3),('101','P04',4),('101','P05',5),('101','P06',6),('101','P07',7),('101','P08',8),
('202','P09',1),('202','P10',2),('202','P11',3),('202','P12',4),('202','P13',5),('202','P14',6),('202','P03',7),('202','P02',8),
('303','P11',1),('303','P12',2),('303','P13',3),('303','P14',4),('303','P15',5),('303','P16',6),('303','P07',7),('303','P08',8),
('404','P14',1),('404','P13',2),('404','P04',3),('404','P01',4),('404','P17',5),('404','P18',6),('404','P19',7),('404','P20',8),
('505','P01',1),('505','P04',2),('505','P07',3),('505','P10',4),('505','P13',5),('505','P16',6),('505','P19',7),('505','P01',8)
) AS x(line_code, stop_code, position)
JOIN public.lines l ON l.code = x.line_code
JOIN public.stops s ON s.code = x.stop_code;

INSERT INTO public.schedules (line_id, departure_time, direction, weekday)
SELECT l.id,
       (l.start_time + (g.i * (l.frequency_min || ' minutes')::interval))::time,
       d.dir,
       w.wd
FROM public.lines l
CROSS JOIN LATERAL generate_series(0, 24) AS g(i)
CROSS JOIN (VALUES ('ida'), ('volta')) AS d(dir)
CROSS JOIN (VALUES ('util'), ('sabado'), ('domingo')) AS w(wd)
WHERE (l.start_time + (g.i * (l.frequency_min || ' minutes')::interval))::time <= l.end_time;

INSERT INTO public.buses (code, line_id, destination, status, speed_kmh, lat, lng)
SELECT b.code, l.id, b.destination, b.status, b.speed, b.lat, b.lng
FROM (VALUES
('3024','101','Jardim Europa','Em movimento',32,-23.2010,-46.5590),
('3025','101','Centro','Em movimento',28,-23.2190,-46.5350),
('3110','202','Bela Vista','Em movimento',41,-23.1960,-46.5470),
('3111','202','Vila Nova','Parado',0,-23.2060,-46.5340),
('3220','303','Portal Sul','Em movimento',36,-23.2030,-46.5380),
('3221','303','Universitário','Em movimento',24,-23.2150,-46.5220),
('3330','404','Aeroporto Regional','Em movimento',47,-23.2100,-46.5300),
('3331','404','Bela Vista','Fora de operação',0,-23.1830,-46.5490),
('3440','505','Terminal Central','Em movimento',30,-23.2050,-46.5520),
('3441','505','Terminal Central','Parado',0,-23.2180,-46.5180)
) AS b(code, line_code, destination, status, speed, lat, lng)
JOIN public.lines l ON l.code = b.line_code;

INSERT INTO public.bus_locations (bus_id, lat, lng, speed_kmh, recorded_at)
SELECT b.id, b.lat + (g.i * 0.0004), b.lng + (g.i * 0.0004), GREATEST(b.speed_kmh - g.i * 2, 0), now() - (g.i * interval '30 seconds')
FROM public.buses b CROSS JOIN generate_series(0, 5) AS g(i);
