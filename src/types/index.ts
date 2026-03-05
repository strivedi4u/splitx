export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
}

export interface Group {
  id: string;
  name: string;
  icon: string;
  members: string[];
  createdAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  splitType: 'equal' | 'unequal' | 'percentage';
  splits?: Record<string, number>;
  date: string;
  category: string;
  imageUrls?: string[];
}

export interface Settlement {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  date: string;
}

export interface ActivityItem {
  id: string;
  type: 'expense' | 'settlement' | 'group_created';
  description: string;
  amount?: number;
  date: string;
  groupId?: string;
  userId: string;
}
