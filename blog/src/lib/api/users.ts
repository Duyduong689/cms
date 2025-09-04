import { User, UserCreateInput, UserUpdateInput, UserQueryParams, UsersResponse } from "@/lib/schemas/user";

// Mock data - replace with real API calls later
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "STAFF",
    status: "ACTIVE",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    role: "CUSTOMER",
    status: "DISABLED",
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    role: "STAFF",
    status: "ACTIVE",
    createdAt: "2024-01-19T11:30:00Z",
    updatedAt: "2024-01-19T11:30:00Z",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to filter users based on query parameters
const filterUsers = (users: User[], params: UserQueryParams): User[] => {
  let filtered = [...users];

  // Text search (name or email)
  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    );
  }

  // Role filter
  if (params.role) {
    filtered = filtered.filter(user => user.role === params.role);
  }

  // Status filter
  if (params.status) {
    filtered = filtered.filter(user => user.status === params.status);
  }

  // Sorting
  if (params.sort) {
    filtered.sort((a, b) => {
      const aValue = a[params.sort as keyof User] as string;
      const bValue = b[params.sort as keyof User] as string;
      const order = params.order === 'desc' ? -1 : 1;
      return aValue.localeCompare(bValue) * order;
    });
  }

  return filtered;
};

// API functions
export const usersApi = {
  getAll: async (params?: UserQueryParams): Promise<UsersResponse> => {
    await delay(500); // Simulate network delay

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    
    const filteredUsers = filterUsers(mockUsers, params || {});
    const total = filteredUsers.length;
    const pages = Math.ceil(total / limit);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = filteredUsers.slice(startIndex, endIndex);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages,
      },
    };
  },

  getById: async (id: string): Promise<User> => {
    await delay(300);
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  },

  create: async (userData: UserCreateInput): Promise<User> => {
    await delay(500);
    
    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    const newUser: User = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    return newUser;
  },

  update: async (id: string, userData: UserUpdateInput): Promise<User> => {
    await delay(500);
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Check if email already exists (excluding current user)
    if (userData.email) {
      const existingUser = mockUsers.find(u => u.email === userData.email && u.id !== id);
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }
    
    const updatedUser: User = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    await delay(500);
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Prevent deletion of the last remaining ADMIN
    const user = mockUsers[userIndex];
    if (user.role === 'ADMIN') {
      const adminCount = mockUsers.filter(u => u.role === 'ADMIN').length;
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last remaining admin user');
      }
    }
    
    mockUsers.splice(userIndex, 1);
    return { success: true };
  },

  toggleStatus: async (id: string): Promise<User> => {
    await delay(500);
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const user = mockUsers[userIndex];
    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    
    const updatedUser: User = {
      ...user,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  },

  resetPassword: async (id: string): Promise<{ success: boolean }> => {
    await delay(500);
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // In a real implementation, this would send a password reset email
    // For now, we just simulate success
    return { success: true };
  },
};
