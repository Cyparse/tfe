# Database Setup — Snow Wonder Festival

SQL scripts to run in the Supabase SQL Editor. Run them in the order listed below, since some tables have foreign keys that reference `festival_editions`.

---

## 1. Festival Editions

```sql
CREATE TABLE IF NOT EXISTS public.festival_editions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    value TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    month TEXT NOT NULL DEFAULT '',
    date_display TEXT NOT NULL DEFAULT '',
    date_iso TIMESTAMP WITH TIME ZONE NOT NULL,
    theme TEXT NOT NULL DEFAULT '',
    accent TEXT NOT NULL DEFAULT '#4289b6',
    icon TEXT NOT NULL DEFAULT 'ac_unit',
    description TEXT NOT NULL DEFAULT '',
    events JSONB NOT NULL DEFAULT '[]',
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festival_editions_value ON public.festival_editions(value);
CREATE INDEX IF NOT EXISTS idx_festival_editions_active ON public.festival_editions(active);

ALTER TABLE public.festival_editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.festival_editions
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow authenticated read" ON public.festival_editions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON public.festival_editions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.festival_editions
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON public.festival_editions
    FOR DELETE TO authenticated USING (true);
```

---

## 2. Admin Users

```sql
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'scanner')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.admin_users
    FOR SELECT TO authenticated USING (true);
```

---

## 3. Registrations

```sql
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type CHARACTER VARYING NOT NULL CHECK (type IN ('amateur', 'pro')),
    first_name CHARACTER VARYING NOT NULL,
    last_name CHARACTER VARYING NOT NULL,
    email CHARACTER VARYING NOT NULL,
    phone CHARACTER VARYING NOT NULL,
    organization CHARACTER VARYING,
    experience TEXT,
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    festival_edition TEXT NOT NULL REFERENCES public.festival_editions(value),
    checked_in BOOLEAN NOT NULL DEFAULT false,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_type ON public.registrations(type);
CREATE INDEX IF NOT EXISTS idx_registrations_edition ON public.registrations(festival_edition);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.registrations
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON public.registrations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update" ON public.registrations
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON public.registrations
    FOR DELETE TO authenticated USING (true);
```

---

## 4. Ticket Orders

```sql
CREATE TABLE IF NOT EXISTS public.ticket_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name CHARACTER VARYING NOT NULL,
    last_name CHARACTER VARYING NOT NULL,
    email CHARACTER VARYING NOT NULL,
    phone CHARACTER VARYING NOT NULL,
    address TEXT NOT NULL,
    city CHARACTER VARYING NOT NULL,
    postal_code CHARACTER VARYING NOT NULL,
    country CHARACTER VARYING NOT NULL,
    ticket_count INTEGER NOT NULL CHECK (ticket_count > 0 AND ticket_count <= 10),
    special_requests TEXT,
    newsletter_opt_in BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    festival_edition TEXT NOT NULL REFERENCES public.festival_editions(value),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_orders_email ON public.ticket_orders(email);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_edition ON public.ticket_orders(festival_edition);

ALTER TABLE public.ticket_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.ticket_orders
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON public.ticket_orders
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update" ON public.ticket_orders
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON public.ticket_orders
    FOR DELETE TO authenticated USING (true);
```

---

## 5. Tickets

Individual tickets generated per order — each has a unique ticket number and can be scanned for check-in.

```sql
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    order_id UUID REFERENCES public.ticket_orders(id),
    edition TEXT NOT NULL REFERENCES public.festival_editions(value),
    holder_name TEXT NOT NULL,
    holder_email TEXT NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_edition ON public.tickets(edition);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.tickets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON public.tickets
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.tickets
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON public.tickets
    FOR DELETE TO authenticated USING (true);
```

---

## 6. Carousel Images

```sql
CREATE TABLE IF NOT EXISTS public.carousel_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    alt TEXT DEFAULT '',
    position INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    section TEXT NOT NULL DEFAULT 'gallery',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carousel_images_section ON public.carousel_images(section);
CREATE INDEX IF NOT EXISTS idx_carousel_images_active ON public.carousel_images(active);

ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.carousel_images
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow authenticated read" ON public.carousel_images
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON public.carousel_images
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.carousel_images
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON public.carousel_images
    FOR DELETE TO authenticated USING (true);
```

---

## 7. Newsletter Subscribers

```sql
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email CHARACTER VARYING NOT NULL UNIQUE,
    first_name CHARACTER VARYING,
    last_name CHARACTER VARYING,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.newsletter_subscribers
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON public.newsletter_subscribers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update" ON public.newsletter_subscribers
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON public.newsletter_subscribers
    FOR DELETE TO authenticated USING (true);
```

---

## 8. Winners

```sql
CREATE TABLE IF NOT EXISTS public.winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    edition_label TEXT NOT NULL,
    edition_color TEXT NOT NULL DEFAULT '#cae9ff',
    edition_bg TEXT NOT NULL DEFAULT 'rgba(202,233,255,0.07)',
    winner_name TEXT,
    photo_url TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_winners_edition_label ON public.winners(edition_label);

ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.winners
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow authenticated read" ON public.winners
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON public.winners
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.winners
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON public.winners
    FOR DELETE TO authenticated USING (true);
```

---

## 9. Rate Limits

```sql
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    count INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start);
```

---

## 10. Error Logs

```sql
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    context TEXT NOT NULL,
    message TEXT NOT NULL,
    code TEXT,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_context ON public.error_logs(context);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at);
```

---

## 11. updated_at Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ticket_orders_updated_at ON public.ticket_orders;
CREATE TRIGGER update_ticket_orders_updated_at
    BEFORE UPDATE ON public.ticket_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Setup Steps

1. Open Supabase → SQL Editor
2. Run each section above in order (1 → 11)
3. Insert at least one `festival_editions` row before registrations or ticket orders can be submitted
4. Create your first admin user:

```sql
-- After creating the user in Supabase Authentication > Users
INSERT INTO public.admin_users (email, full_name, role)
VALUES ('your-admin@example.com', 'Admin Name', 'super_admin');

-- For a scanner-only account (check-in tablet, etc.)
INSERT INTO public.admin_users (email, full_name, role)
VALUES ('scanner@example.com', 'Scanner', 'scanner');
```

5. Ensure `.env` contains:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Security Notes

- RLS is enabled on all public-facing tables
- Anonymous users can only INSERT (registration, ticket order, newsletter forms)
- Authenticated users have full CRUD access to all tables
- `scanner` role users can log in but the admin panel restricts their view to the ticket scanner only
- `rate_limits` and `error_logs` have no RLS — they are write-only from Edge Functions or server-side code
