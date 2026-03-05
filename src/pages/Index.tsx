import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { NotificationProvider } from '@/context/NotificationContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import AuthScreen from '@/components/AuthScreen';
import UpdateChecker from '@/components/UpdateChecker';
import BottomNav from '@/components/BottomNav';
import Dashboard from '@/components/Dashboard';
import Groups from '@/components/Groups';
import GroupDetail from '@/components/GroupDetail';
import ActivityScreen from '@/components/ActivityScreen';
import ProfileScreen from '@/components/ProfileScreen';
import AddExpenseSheet from '@/components/AddExpenseSheet';
import SettleUpSheet from '@/components/SettleUpSheet';
import CreateGroupSheet from '@/components/CreateGroupSheet';
import JoinGroupSheet from '@/components/JoinGroupSheet';

type Tab = 'dashboard' | 'groups' | 'activity' | 'profile';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [settleGroupId, setSettleGroupId] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('splitx_onboarded') === '1');

  if (isLoading) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full" />
      </div>
    );
  }

  // Show welcome onboarding for first-time users
  if (!onboarded) {
    return (
      <WelcomeScreen
        onComplete={() => {
          localStorage.setItem('splitx_onboarded', '1');
          setOnboarded(true);
        }}
      />
    );
  }

  if (!user) return <AuthScreen />;

  const handleGoToGroups = (groupId?: string) => {
    setActiveTab('groups');
    if (groupId) setSelectedGroupId(groupId);
  };

  return (
    <NotificationProvider>
      <AppProvider>
      <div className="h-full w-full bg-background relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[35%] rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(42 100% 50%), transparent 70%)' }} />
        <div className="absolute bottom-[20%] left-[-15%] w-[40%] h-[30%] rounded-full opacity-[0.02] pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(45 100% 65%), transparent 70%)' }} />

        <div className="h-full w-full relative z-[2]">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">
                <Dashboard onAddExpense={() => setShowAddExpense(true)} onGoToGroups={handleGoToGroups} />
              </motion.div>
            )}
            {activeTab === 'groups' && !selectedGroupId && (
              <motion.div key="groups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">
                <Groups
                  onSelectGroup={setSelectedGroupId}
                  onCreateGroup={() => setShowCreateGroup(true)}
                  onJoinGroup={() => setShowJoinGroup(true)}
                />
              </motion.div>
            )}
            {activeTab === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">
                <ActivityScreen />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">
                <ProfileScreen />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedGroupId && activeTab === 'groups' && (
              <GroupDetail
                groupId={selectedGroupId}
                onBack={() => setSelectedGroupId(null)}
                onAddExpense={() => setShowAddExpense(true)}
                onSettle={(gId) => setSettleGroupId(gId)}
              />
            )}
          </AnimatePresence>
        </div>

        <BottomNav activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setSelectedGroupId(null); }} />

        <AddExpenseSheet open={showAddExpense} onClose={() => setShowAddExpense(false)} preselectedGroupId={selectedGroupId || undefined} />
        <SettleUpSheet open={!!settleGroupId} onClose={() => setSettleGroupId(null)} groupId={settleGroupId || ''} />
        <CreateGroupSheet open={showCreateGroup} onClose={() => setShowCreateGroup(false)} />
        <JoinGroupSheet open={showJoinGroup} onClose={() => setShowJoinGroup(false)} />
      </div>
      </AppProvider>
    </NotificationProvider>
  );
}

const Index = () => (
  <AuthProvider>
    <UpdateChecker />
    <AppContent />
  </AuthProvider>
);

export default Index;
