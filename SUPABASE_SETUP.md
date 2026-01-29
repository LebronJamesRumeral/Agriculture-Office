/**
 * Setup Instructions for Supabase Users Table
 * 
 * STEP 1: Create the users table in Supabase
 * - Go to https://app.supabase.com
 * - Select your project
 * - Go to SQL Editor
 * - Click "New Query"
 * - Copy and paste the entire content of lib/sql-schema.sql
 * - Click "Run"
 * 
 * STEP 2: Create test accounts
 * - Go to Authentication > Users
 * - Click "Add user"
 * - Use the credentials from lib/mock-accounts.ts:
 * 
 *   Email: farmer@test.com
 *   Password: password123
 * 
 *   Email: officer@test.com
 *   Password: password123
 * 
 *   Email: admin@test.com
 *   Password: password123
 * 
 *   Email: fisherman@test.com
 *   Password: password123
 * 
 * STEP 3: Populate user profiles (Optional - for full user data)
 * - After creating auth users, you can run an insert script
 * - Or use the API endpoint to create profiles after sign up
 * 
 * STEP 4: Test the login
 * - Go to http://localhost:3000/login
 * - Try signing in with any of the test credentials above
 * 
 * TABLE SCHEMA:
 * ├── id (UUID, Primary Key, linked to auth.users)
 * ├── email (TEXT, Unique)
 * ├── full_name (TEXT)
 * ├── role (TEXT) - farmer, officer, admin
 * ├── phone (TEXT)
 * ├── address (TEXT)
 * ├── municipality (TEXT)
 * ├── barangay (TEXT)
 * ├── created_at (TIMESTAMP)
 * └── updated_at (TIMESTAMP)
 */
