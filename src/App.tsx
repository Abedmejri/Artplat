// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { SessionProvider, useSession } from './hooks/useSession';
import { ProfileProvider } from './hooks/useProfile';
import { useEffect } from 'react';

// Import Pages and Components

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import ArtworkDetail from './pages/ArtworkDetail';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

// Import your local background image
import AppBackgroundImage from './assets/hogwarts-hall-bg.jpg';
import Sidebar from './components/Sidebar';
import Settings from './pages/Settings';
import MusicPlayer from './components/MusicPlayer';
import MessagesPage from './pages/MessagesPage';

// Define the style object for the background
const appStyle = {
  backgroundImage: `url(${AppBackgroundImage})`,
  backgroundSize: 'cover',
  backgroundAttachment: 'fixed',
};

// Layout component with Navbar for main pages
const MainLayout = () => (
  <div className="md:flex">
    <Sidebar />
    <main className="flex-1">
      {/* The padding provides the essential whitespace for our minimalist design */}
      <div className="py-8 px-4 sm:px-6 lg:px-12">
        <Outlet />
      </div>
    </main>
  </div>
);

// Component to protect routes that require authentication
const ProtectedRoute = () => {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

  return session ? <Outlet /> : null;
};

// Component to handle redirection for the login page
const LoginPage = () => {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);
  
  return <AuthPage />;
};

function App() {
  return (
    // Apply the default font and background style here
    <div className="font-body" style={appStyle}>
      <div className="bg-ink-black/70 min-h-screen">
        <SessionProvider>
          <ProfileProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Explore />} />
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/challenges/:id" element={<ChallengeDetail />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/artwork/:id" element={<ArtworkDetail />} />
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/messages" element={<MessagesPage />} />
  <Route path="/messages/:conversationId" element={<MessagesPage />} />
                  </Route>
                </Route>
                <Route path="*" element={ <div className='text-center text-parchment p-10'><h1 className='text-4xl font-heading'>404 - Lost in the Library</h1><p>The page you are looking for is in the restricted section.</p></div> }/>
              </Routes>
            </Router>
            <MusicPlayer />
          </ProfileProvider>
        </SessionProvider>
      </div>
    </div>
  );
}

export default App;