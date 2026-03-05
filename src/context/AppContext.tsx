import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '@/lib/api';
import { User, Group, Expense, Settlement, ActivityItem } from '@/types';

interface BalanceEntry {
  userId: string;
  amount: number;
}

interface CreateGroupResult {
  groupId: string;
  inviteCode: string;
}

interface JoinGroupResult {
  success: boolean;
  error?: string;
  groupName?: string;
}

interface AppContextType {
  users: User[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  activities: ActivityItem[];
  currentUser: User;
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => Promise<void>;
  addSettlement: (settlement: Omit<Settlement, 'id'>) => Promise<void>;
  getGroupExpenses: (groupId: string) => Expense[];
  getGroupSettlements: (groupId: string) => Settlement[];
  getGroupBalances: (groupId: string) => BalanceEntry[];
  getTotalOwed: () => number;
  getTotalOwe: () => number;
  getNetBalance: () => number;
  getUserById: (id: string) => User | undefined;
  getGroupById: (id: string) => Group | undefined;
  createGroup: (name: string, icon: string) => Promise<CreateGroupResult>;
  joinGroup: (code: string) => Promise<JoinGroupResult>;
  leaveGroup: (groupId: string) => Promise<void>;
  getGroupInviteCode: (groupId: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();

  const currentUser: User = authUser ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    avatar: authUser.avatar,
    color: authUser.color,
  } : { id: 'guest', name: 'Guest', email: '', avatar: '👤', color: '#888' };

  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [users, setUsers] = useState<User[]>([currentUser]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppData = useCallback(async () => {
    if (!authUser) {
      setGroups([]); setExpenses([]); setSettlements([]); setActivities([]); setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [grpRes, expRes, setRes, actRes] = await Promise.all([
        apiFetch<{ success: boolean; groups: any[] }>('/groups'),
        apiFetch<{ success: boolean; expenses: any[] }>('/expenses'),
        apiFetch<{ success: boolean; settlements: any[] }>('/settlements'),
        apiFetch<{ success: boolean; activities: any[] }>('/activities')
      ]);

      if (grpRes.success) setGroups(grpRes.groups as Group[]);
      if (expRes.success) setExpenses(expRes.expenses as Expense[]);
      if (setRes.success) setSettlements(setRes.settlements as Settlement[]);
      if (actRes.success) setActivities(actRes.activities as ActivityItem[]);

    } catch (err) {
      console.error('Failed to load app data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  // Derive all known users from the fetched data
  useEffect(() => {
    const userMap = new Map<string, User>();
    userMap.set(currentUser.id, currentUser);

    // Extract users from populated group members
    groups.forEach((g: any) => {
      if (g.membersData) {
        g.membersData.forEach((u: User) => userMap.set(u.id, u));
      }
    });

    setUsers(Array.from(userMap.values()));
  }, [groups, currentUser.id]);

  const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);
  const getGroupById = useCallback((id: string) => groups.find(g => g.id === id), [groups]);
  const getGroupExpenses = useCallback((groupId: string) => expenses.filter(e => e.groupId === groupId), [expenses]);
  const getGroupSettlements = useCallback((groupId: string) => settlements.filter(s => s.groupId === groupId), [settlements]);

  const getGroupBalances = useCallback((groupId: string): BalanceEntry[] => {
    const uid = currentUser.id;
    const groupExpenses = expenses.filter(e => e.groupId === groupId);
    const groupSettlements = settlements.filter(s => s.groupId === groupId);
    const balances: Record<string, number> = {};

    groupExpenses.forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;
      if (exp.paidBy === uid) {
        exp.splitBetween.forEach(memberId => {
          if (memberId !== uid) balances[memberId] = (balances[memberId] || 0) + share;
        });
      } else if (exp.splitBetween.includes(uid)) {
        balances[exp.paidBy] = (balances[exp.paidBy] || 0) - share;
      }
    });

    groupSettlements.forEach(s => {
      if (s.to === uid) balances[s.from] = (balances[s.from] || 0) - s.amount;
      if (s.from === uid) balances[s.to] = (balances[s.to] || 0) + s.amount;
    });

    return Object.entries(balances).map(([userId, amount]) => ({ userId, amount }));
  }, [expenses, settlements, currentUser.id]);

  const calculateNetBalances = useCallback(() => {
    const uid = currentUser.id;
    const balances: Record<string, number> = {};

    expenses.forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;
      if (exp.paidBy === uid) {
        exp.splitBetween.forEach(memberId => {
          if (memberId !== uid) balances[memberId] = (balances[memberId] || 0) + share;
        });
      } else if (exp.splitBetween.includes(uid)) {
        balances[exp.paidBy] = (balances[exp.paidBy] || 0) - share;
      }
    });

    settlements.forEach(s => {
      if (s.to === uid) balances[s.from] = (balances[s.from] || 0) - s.amount;
      if (s.from === uid) balances[s.to] = (balances[s.to] || 0) + s.amount;
    });

    return balances;
  }, [expenses, settlements, currentUser.id]);

  const getTotalOwed = useCallback(() => {
    return Object.values(calculateNetBalances()).filter(v => v > 0).reduce((a, b) => a + b, 0);
  }, [calculateNetBalances]);

  const getTotalOwe = useCallback(() => {
    return Math.abs(Object.values(calculateNetBalances()).filter(v => v < 0).reduce((a, b) => a + b, 0));
  }, [calculateNetBalances]);

  const getNetBalance = useCallback(() => getTotalOwed() - getTotalOwe(), [getTotalOwed, getTotalOwe]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    try {
      const res = await apiFetch<{ success: boolean; expense: Expense }>('/expenses', {
        method: 'POST',
        data: expense
      });
      if (res.success && res.expense) {
        setExpenses(prev => [res.expense, ...prev]);
        fetchAppData(); // refresh activities
      }
    } catch (err) {
      console.error('Failed to add expense', err);
      throw err;
    }
  }, [fetchAppData]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    try {
      const res = await apiFetch<{ success: boolean; expense: Expense }>(`/expenses/${id}`, {
        method: 'PATCH',
        data: updates
      });
      if (res.success && res.expense) {
        setExpenses(prev => prev.map(e => e.id === id ? res.expense : e));
      }
    } catch (err) {
      console.error('Failed to update expense', err);
      throw err;
    }
  }, []);

  const addSettlement = useCallback(async (settlement: Omit<Settlement, 'id'>) => {
    try {
      const res = await apiFetch<{ success: boolean; settlement: Settlement }>('/settlements', {
        method: 'POST',
        data: settlement
      });
      if (res.success && res.settlement) {
        setSettlements(prev => [res.settlement, ...prev]);
        fetchAppData(); // refresh activities
      }
    } catch (err) {
      console.error('Failed to add settlement', err);
      throw err;
    }
  }, [fetchAppData]);

  const createGroup = useCallback(async (name: string, icon: string): Promise<CreateGroupResult> => {
    try {
      const res = await apiFetch<{ success: boolean; group: Group; inviteCode: string }>('/groups', {
        method: 'POST',
        data: { name, icon }
      });
      if (res.success && res.group) {
        setGroups(prev => [...prev, res.group]);
        fetchAppData(); // refresh to get activities
        return { groupId: res.group.id, inviteCode: res.inviteCode || '' };
      }
      throw new Error('Failed to create group');
    } catch (err: any) {
      console.error('Failed to create group', err);
      throw err;
    }
  }, [fetchAppData]);

  const joinGroup = useCallback(async (code: string): Promise<JoinGroupResult> => {
    try {
      const res = await apiFetch<{ success: boolean; group: Group; message?: string }>('/groups/join', {
        method: 'POST',
        data: { inviteCode: code }
      });
      if (res.success && res.group) {
        setGroups(prev => [...prev, res.group]);
        fetchAppData(); // fetch to get its expenses/activities
        return { success: true, groupName: res.group.name };
      }
      return { success: false, error: res.message || 'Failed to join group' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid invite code' };
    }
  }, [fetchAppData]);

  const leaveGroup = useCallback(async (groupId: string) => {
    try {
      await apiFetch(`/groups/${groupId}/leave`, { method: 'DELETE' });
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (err) {
      console.error('Failed to leave group', err);
      throw err;
    }
  }, []);

  const getGroupInviteCode = useCallback((groupId: string): string => {
    const group: any = groups.find(g => g.id === groupId);
    return group?.inviteCode || '';
  }, [groups]);

  return (
    <AppContext.Provider value={{
      users, groups, expenses, settlements, activities, currentUser, isLoading,
      addExpense, updateExpense, addSettlement, getGroupExpenses, getGroupSettlements, getGroupBalances,
      getTotalOwed, getTotalOwe, getNetBalance, getUserById, getGroupById,
      createGroup, joinGroup, leaveGroup, getGroupInviteCode,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
