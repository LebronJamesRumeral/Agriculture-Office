// Mock login accounts for testing
// Add these users in Supabase Auth first, then create their profiles in the users table

export const mockAccounts = [
  {
    email: "farmer@test.com",
    password: "password123",
    full_name: "Juan Dela Cruz",
    role: "farmer",
    phone: "09123456789",
    address: "123 Agricultural St",
    municipality: "Olongapo",
    barangay: "Barangay 1",
  },
  {
    email: "officer@test.com",
    password: "password123",
    full_name: "Maria Santos",
    role: "officer",
    phone: "09198765432",
    address: "456 Admin Building",
    municipality: "Olongapo",
    barangay: "Barangay 2",
  },
  {
    email: "admin@test.com",
    password: "password123",
    full_name: "Dr. Jose Rizal",
    role: "admin",
    phone: "09111111111",
    address: "789 Government Center",
    municipality: "Olongapo",
    barangay: "Barangay 3",
  },
  {
    email: "fisherman@test.com",
    password: "password123",
    full_name: "Pedro Manalo",
    role: "farmer", // Can be fisherman
    phone: "09122222222",
    address: "Seaside Community",
    municipality: "Olongapo",
    barangay: "Barangay 4",
  },
];
