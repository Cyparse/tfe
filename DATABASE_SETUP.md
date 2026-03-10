# CMS Backend - Database Setup Instructions

This SQL script should be run in your Supabase SQL Editor to set up the required tables and security policies for the CMS backend.

## Tables to Create

### 1. Registrations Table (if not exists)
```sql
-- Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('amateur', 'pro')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    organization TEXT,
    experience TEXT,
    terms_accepted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_registrations_type ON public.registrations(type);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert (for registration form)
CREATE POLICY "Allow public insert" ON public.registrations
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Allow authenticated users to read all
CREATE POLICY "Allow authenticated read" ON public.registrations
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON public.registrations
    FOR UPDATE
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON public.registrations
    FOR DELETE
    TO authenticated
    USING (true);
```

### 2. Ticket Orders Table (if not exists)
```sql
-- Create ticket_orders table
CREATE TABLE IF NOT EXISTS public.ticket_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    ticket_count INTEGER NOT NULL DEFAULT 1 CHECK (ticket_count > 0 AND ticket_count <= 10),
    special_requests TEXT,
    newsletter BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_ticket_orders_email ON public.ticket_orders(email);

-- Enable Row Level Security
ALTER TABLE public.ticket_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert (for ticket form)
CREATE POLICY "Allow public insert" ON public.ticket_orders
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Allow authenticated users to read all
CREATE POLICY "Allow authenticated read" ON public.ticket_orders
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON public.ticket_orders
    FOR UPDATE
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON public.ticket_orders
    FOR DELETE
    TO authenticated
    USING (true);
```

### 3. Admin Users Table
```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read admin_users
CREATE POLICY "Allow authenticated read" ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (true);
```

### 4. Create Updated At Trigger Function
```sql
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to registrations
DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to ticket_orders
DROP TRIGGER IF EXISTS update_ticket_orders_updated_at ON public.ticket_orders;
CREATE TRIGGER update_ticket_orders_updated_at
    BEFORE UPDATE ON public.ticket_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to admin_users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Setup Steps

1. **Run SQL Scripts**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste each section above
   - Execute them one by one

2. **Create Admin User**
   ```sql
   -- First, create a user in Supabase Authentication (via Dashboard or Auth API)
   -- Then add them to admin_users table
   INSERT INTO public.admin_users (email, full_name, role)
   VALUES ('your-admin@example.com', 'Admin Name', 'super_admin');
   ```

3. **Set up Authentication**
   - Go to Authentication > Providers in Supabase
   - Enable Email auth provider
   - Create your first admin user in Authentication > Users

4. **Environment Variables**
   Make sure your `.env` file has:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Testing

1. Test public access:
   - Try registering via the public form
   - Try ordering tickets via the public form

2. Test admin access:
   - Navigate to `/admin` or `#admin`
   - Login with your admin credentials
   - Verify you can view, edit, and delete records

## Security Notes

- RLS (Row Level Security) is enabled on all tables
- Anonymous users can only INSERT data (for forms)
- Only authenticated users can read, update, and delete
- Admin users are verified against the `admin_users` table
