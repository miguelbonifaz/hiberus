export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customerId: number;
  status: 'pending' | 'paid' | 'failed';
  total: number;
  createdAt: string;
  paidAt: string | null;
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  role: 'ADMIN' | 'CLIENT';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}