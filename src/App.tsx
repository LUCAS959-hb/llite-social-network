import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PresenceProvider } from './context/PresenceContext';
import { SocialProvider, useSocial } from './context/SocialContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { SidebarLeft } from './components/layout/SidebarLeft';
import { SidebarRight } from './components/layout/SidebarRight';
import { FeedView } from './components/feed/FeedView';
import { VideosView } from './components/video/VideosView';
import { FriendsView } from './components/friends/FriendsView';
import { MessengerView } from './components/messages/MessengerView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ProfileView } from './components/profile/ProfileView';
import { SearchResultsView } from './components/search/SearchResultsView';
import { AuthModal } from './components/auth/AuthModal';
import { MediaLightbox } from './components/common/MediaLightbox';

const MainLayout: React.FC = () => {
  const { activeTab } = useSocial();

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedView />;
      case 'videos':
        return <VideosView />;
      case 'friends':
        return <FriendsView />;
      case 'messages':
        return <MessengerView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView />;
      case 'search':
        return <SearchResultsView />;
      default:
        return <FeedView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 flex flex-col font-sans selection:bg-[#1877F2]/20 selection:text-[#1877F2]">
      {/* Top Persistent Header */}
      <Navbar />

      {/* Main Content Area with Desktop Sidebars */}
      <div className="flex-1 flex justify-center w-full max-w-7xl mx-auto pb-16 md:pb-4">
        {/* Left Sidebar on Desktop */}
        <SidebarLeft />

        {/* Dynamic Center Page */}
        <main className="flex-1 w-full min-w-0 flex flex-col items-center">
          {renderContent()}
        </main>

        {/* Right Sidebar on Desktop (hide in messages view to give chat full width) */}
        {activeTab !== 'messages' && <SidebarRight />}
      </div>

      {/* Android and Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals */}
      <AuthModal />
      <MediaLightbox />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PresenceProvider>
        <SocialProvider>
          <MainLayout />
        </SocialProvider>
      </PresenceProvider>
    </AuthProvider>
  );
}
