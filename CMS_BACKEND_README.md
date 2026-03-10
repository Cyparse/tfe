# CMS-Like Backend Documentation

A comprehensive CMS backend system integrated with Supabase for managing registrations, ticket reservations, and generic content through a powerful admin panel.

## Features

### 🎯 Core Functionality
- **Registration Management**: Handle amateur and professional registrations
- **Ticket/Reservation Management**: Manage ticket orders and reservations
- **Generic Content Management**: CRUD operations for any Supabase table
- **Admin Authentication**: Secure admin-only access
- **Data Export**: CSV export functionality
- **Search & Filtering**: Advanced filtering and search capabilities
- **Pagination**: Efficient data loading with pagination

### 📊 Admin Dashboard
- Real-time statistics and metrics
- Quick overview of registrations and tickets
- Visual data presentation
- Quick action buttons

## Project Structure

```
src/
├── services/               # Backend service layer
│   ├── authService.js     # Admin authentication
│   ├── registrationService.js  # Registration CRUD operations
│   ├── ticketService.js   # Ticket order CRUD operations
│   └── contentService.js  # Generic content CRUD operations
│
├── admin/                 # Admin panel components
│   ├── AdminLogin.jsx     # Admin login page
│   ├── AdminPanel.jsx     # Main admin panel container
│   ├── Dashboard.jsx      # Statistics dashboard
│   ├── RegistrationManager.jsx  # Manage registrations
│   ├── TicketManager.jsx  # Manage ticket orders
│   └── ContentManager.jsx # Generic content manager
│
├── components/            # Public-facing components
│   ├── Registration.jsx   # Public registration form
│   ├── Tickets.jsx        # Public ticket order form
│   └── ...
│
└── App.jsx               # Main app with routing
```

## Getting Started

### 1. Database Setup

Follow the instructions in `DATABASE_SETUP.md` to:
- Create required tables in Supabase
- Set up Row Level Security policies
- Create your first admin user

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## Usage

### Accessing the Admin Panel

Navigate to `/admin` or add `#admin` to your URL:
- Example: `http://localhost:5173/admin`
- Or: `http://localhost:5173/#admin`

### Admin Login

Use credentials for a user that exists in both:
1. Supabase Authentication (Users)
2. `admin_users` table

### Managing Registrations

1. Go to Admin Panel → Registrations tab
2. **View**: Click "View" to see full registration details
3. **Search**: Use the search box to filter by name or email
4. **Filter**: Filter by registration type (Amateur/Pro)
5. **Export**: Download all registrations as CSV
6. **Delete**: Remove unwanted registrations

### Managing Ticket Orders

1. Go to Admin Panel → Tickets tab
2. **View**: Click "View" to see full order details
3. **Search**: Search by name or email
4. **Sort**: Sort by date, name, or ticket count
5. **Export**: Download all orders as CSV
6. **Delete**: Remove orders

### Generic Content Management

1. Go to Admin Panel → Content tab
2. **Select Table**: Choose from dropdown or enter custom table name
3. **View Data**: See all records in the selected table
4. **Create**: Add new records with the form
5. **Edit**: Update existing records
6. **Delete**: Remove records

## Service APIs

### Authentication Service

```javascript
import { signInAdmin, signOut, getCurrentUser, isAdmin } from './services/authService';

// Sign in
await signInAdmin(email, password);

// Sign out
await signOut();

// Get current user
const user = await getCurrentUser();

// Check if user is admin
const adminStatus = await isAdmin();
```

### Registration Service

```javascript
import { 
    getRegistrations, 
    getRegistrationById,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationStats,
    exportRegistrationsToCSV
} from './services/registrationService';

// Get paginated registrations
const result = await getRegistrations({
    page: 1,
    pageSize: 20,
    type: 'amateur', // or 'pro' or null for all
    search: 'john',
    sortBy: 'created_at',
    sortOrder: 'desc'
});

// Get single registration
const registration = await getRegistrationById(id);

// Create new registration
const newReg = await createRegistration({
    type: 'amateur',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    terms_accepted: true
});

// Update registration
await updateRegistration(id, { phone: '+0987654321' });

// Delete registration
await deleteRegistration(id);

// Get statistics
const stats = await getRegistrationStats();
// Returns: { total, amateur, pro, today }

// Export to CSV
const csv = exportRegistrationsToCSV(registrations);
```

### Ticket Service

```javascript
import { 
    getTicketOrders,
    getTicketOrderById,
    createTicketOrder,
    updateTicketOrder,
    deleteTicketOrder,
    getTicketStats,
    exportTicketOrdersToCSV
} from './services/ticketService';

// Similar API to registrationService
const orders = await getTicketOrders({ page: 1, pageSize: 20 });
const order = await getTicketOrderById(id);
await createTicketOrder(orderData);
await updateTicketOrder(id, updates);
await deleteTicketOrder(id);
const stats = await getTicketStats();
const csv = exportTicketOrdersToCSV(orders);
```

### Content Service (Generic CRUD)

```javascript
import {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    bulkCreate,
    bulkUpdate,
    bulkDelete,
    searchItems
} from './services/contentService';

// Get items from any table
const items = await getItems('custom_table', {
    page: 1,
    pageSize: 50,
    filters: { status: 'active' },
    sortBy: 'created_at',
    sortOrder: 'desc'
});

// CRUD operations
const item = await getItemById('custom_table', id);
await createItem('custom_table', itemData);
await updateItem('custom_table', id, updates);
await deleteItem('custom_table', id);

// Bulk operations
await bulkCreate('custom_table', [item1, item2, item3]);
await bulkDelete('custom_table', [id1, id2, id3]);

// Search
const results = await searchItems('custom_table', 'search term', ['name', 'description']);
```

## Adding Custom Tables

To manage custom content:

1. **Create table in Supabase**:
   ```sql
   CREATE TABLE custom_content (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       title TEXT NOT NULL,
       content TEXT,
       status TEXT DEFAULT 'draft',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Add RLS policies** (similar to existing tables)

3. **Use Content Manager**: In admin panel, select your new table

4. **Or create dedicated manager**: Create a new component using `contentService.js`

## Security

### Row Level Security (RLS)
- All tables have RLS enabled
- Anonymous users can only INSERT (for public forms)
- Authenticated users have full CRUD access
- Admin status verified via `admin_users` table

### Authentication Flow
1. User submits credentials to admin login
2. `authService` authenticates with Supabase Auth
3. Checks if user exists in `admin_users` table
4. Only grants access if both conditions are met

## Customization

### Styling
- Uses Tailwind CSS
- Admin panel uses clean white/gray theme
- Easily customizable via className props

### Adding Features
- Extend service files for new operations
- Create new admin components for specific needs
- Add new tables and manage via ContentManager

### Permissions
- Extend `admin_users` table with role-based permissions
- Modify RLS policies for fine-grained control
- Add middleware checks in services

## Troubleshooting

### Cannot log in to admin
- Verify user exists in Supabase Authentication
- Verify user email exists in `admin_users` table
- Check environment variables are correct

### Tables not showing data
- Check RLS policies are set up correctly
- Verify authenticated user has proper permissions
- Check browser console for errors

### CSV export not working
- Ensure data is loaded before exporting
- Check for special characters in data

## Future Enhancements

Potential additions:
- [ ] Email notifications
- [ ] Advanced analytics and reporting
- [ ] Batch operations UI
- [ ] Media/file upload management
- [ ] Activity logs and audit trails
- [ ] Role-based access control (RBAC)
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Data backup/restore

## Support

For issues or questions:
1. Check the console for error messages
2. Verify Supabase connection and credentials
3. Ensure database tables and policies are set up correctly
4. Review this documentation

---

Built with React, Vite, Supabase, and Tailwind CSS
