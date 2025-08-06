// src/components/Sidebar.tsx

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileDropdown from './ProfileDropdown';
const MessagesIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m21.75 0l-2.14.812a22.5 22.5 0 01-17.42 0L2.25 6.75m19.5 0v.001M2.25 6.75v.001" />;

// --- Reusable SVG Icons ---
const ChatIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.09-.934.09-1.423A7.927 7.927 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />;
const ExploreIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />;
const DuelsIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />;
const AssembliesIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.162c.66-.33-1.02-1.02-1.02-1.02A4.5 4.5 0 005.25 6H5.25a4.5 4.5 0 00-3.182 7.681c-.66.33.25.99.25.99A4.5 4.5 0 005.25 15h3.182c.564.44.184 1.5.184 1.5A4.5 4.5 0 0010.5 21h3.182c.564.44.184-1.05.184-1.05" />;
const CommonRoomIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />;
const SettingsIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.11.55.897.09 1.998.608 2.548.517.55.138 1.498.087 2.054-.05.556.345 1.135.88 1.342.536.206 1.058.11 1.592.11h.012a9 9 0 005.454-1.592c.535-.207.93-.786.88-1.342-.05-.556.43-1.504.087-2.054-.517-.55-.52-1.65.087-2.548.55-.897 1.02-.368 1.11.11.09.542.56 1.008 1.11 1.11.55.102 1.087.025 1.504-.12C21.33.86 22 1.255 22 2.003v11.994c0 .748-.67 1.144-1.255.938-.417-.146-.954-.223-1.504-.12-.55.102-1.02.568-1.11 1.11-.09.542-.56 1.007-1.11 1.11-.55.102-1.086.025-1.504-.12a9.01 9.01 0 00-5.454-1.592h-.012c-.536 0-1.057.096-1.592.11-.535-.207-.93.786-.88 1.342.05.556-.43 1.504-.087 2.054.517.55.52 1.65-.087 2.548-.55.897-1.02.368-1.11-.11-.09-.542-.56-1.008-1.11-1.11-.55-.102-1.086-.025-1.504.12C2.67.86 2 1.255 2 2.003V2.003c0-.748.67-1.144 1.255-.938.417.146.954.223 1.504.12.55-.102 1.02-.568 1.11-1.11zM12 15a3 3 0 100-6 3 3 0 000 6z" />;
const EnterIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12" />;
const HamburgerIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />;
const CloseIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />;

// --- Reusable NavLink Component ---
const NavLink = ({ to, icon, children, onClick }: { to: string, icon: JSX.Element, children: React.ReactNode, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`flex items-center w-full p-4 rounded-lg transition-colors text-lg ${isActive ? 'bg-spell-glow-teal/20 text-white' : 'text-parchment/70 hover:bg-ink-black/50 hover:text-white'}`}>
      <svg className="flex-shrink-0 w-7 h-7" stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">{icon}</svg>
      <span className="ml-4 whitespace-nowrap">{children}</span>
    </Link>
  );
};

const Sidebar = () => {
  const session = useSession();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Main Navigation Links Component ---
  const MainNavLinks = () => (
    <nav className="flex-1 w-full space-y-3">
      <NavLink to="/" icon={<ExploreIcon />} onClick={() => setMobileMenuOpen(false)}>Explore</NavLink>
      <NavLink to="/challenges" icon={<DuelsIcon />} onClick={() => setMobileMenuOpen(false)}>Duels</NavLink>
      <NavLink to="/events" icon={<AssembliesIcon />} onClick={() => setMobileMenuOpen(false)}>Assemblies</NavLink>
      
      <NavLink to="/messages" icon={<MessagesIcon />} onClick={() => setMobileMenuOpen(false)}>Messages</NavLink>
    </nav>
  );

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Fixed Width Version) --- */}
      <aside
        className="hidden md:sticky md:top-0 md:h-screen w-80 bg-ink-black border-r border-parchment/10 md:flex flex-col items-start p-6"
      >
        <Link to="/" className="font-heading text-4xl text-white mb-12 text-left w-full block">ArtHive</Link>
        <MainNavLinks />
        <div className="w-full mt-auto">
          {session ? (
            <ProfileDropdown />
          ) : (
            <NavLink to="/login" icon={<EnterIcon />} onClick={() => setMobileMenuOpen(false)}>Enter</NavLink>
          )}
        </div>
      </aside>

      {/* --- MOBILE HEADER & MENU --- */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-ink-black border-b border-parchment/10">
        <Link to="/" className="font-heading text-3xl text-white">ArtHive</Link>
        <button onClick={() => setMobileMenuOpen(true)} className="text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><HamburgerIcon /></svg>
        </button>
      </header>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-ink-black flex flex-col p-8 md:hidden"
          >
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8 text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><CloseIcon /></svg>
            </button>
            <Link to="/" className="font-heading text-4xl text-white mb-12 text-center w-full block">ArtHive</Link>
            <MainNavLinks />
            <div className="w-full mt-auto">
              {session ? (
                <div className="space-y-3">
                  <NavLink to="/dashboard" icon={<CommonRoomIcon />} onClick={() => setMobileMenuOpen(false)}>Common Room</NavLink>
                  <NavLink to="/settings" icon={<SettingsIcon />} onClick={() => setMobileMenuOpen(false)}>Settings</NavLink>
                   <NavLink to="/messages" icon={<MessagesIcon />} onClick={() => setMobileMenuOpen(false)}>Messages</NavLink>
                </div>
              ) : (
                <NavLink to="/login" icon={<EnterIcon />} onClick={() => setMobileMenuOpen(false)}>Enter</NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;