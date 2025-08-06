// src/pages/Dashboard.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import { useProfile } from '../hooks/useProfile';
import ArtworkUploadForm from '../components/ArtworkUploadForm';
import ArtworkCard, { Artwork } from '../components/ArtworkCard';
import CreateEventModal from '../components/CreateEventModal';
import { motion } from 'framer-motion';

// Define type for events to be listed on the dashboard
interface UserEvent {
  id: number;
  title: string;
}

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const session = useSession();
  const profile = useProfile();
  
  const [myArtworks, setMyArtworks] = useState<Artwork[]>([]);
  const [myEvents, setMyEvents] = useState<UserEvent[]>([]);
  const [loadingArt, setLoadingArt] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch artworks
      (async () => {
        setLoadingArt(true);
        const { data, error } = await supabase.from('artworks').select(`id, title, media_url, profiles(username)`).eq('user_id', session.user.id).order('created_at', { ascending: false });
        if (error) console.error("Error fetching user's artworks:", error);
        else setMyArtworks(data as Artwork[]);
        setLoadingArt(false);
      })();
      // Fetch events
      (async () => {
        setLoadingEvents(true);
        const { data, error } = await supabase.from('events').select('id, title').eq('organizer_id', session.user.id).order('start_date', { ascending: true });
        if (error) console.error("Error fetching user's events:", error);
        else setMyEvents(data as UserEvent[]);
        setLoadingEvents(false);
      })();
    }
  }, [session]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Conditionally render the modal for creating events */}
      {showCreateEventModal && (
        <CreateEventModal 
          onClose={() => setShowCreateEventModal(false)} 
          onEventCreated={() => {
            // Re-fetch events after one is created
            if (session?.user?.id) {
              (async () => {
                setLoadingEvents(true);
                const { data, error } = await supabase.from('events').select('id, title').eq('organizer_id', session.user.id).order('start_date', { ascending: true });
                if (error) console.error("Error fetching user's events:", error);
                else setMyEvents(data as UserEvent[]);
                setLoadingEvents(false);
              })();
            }
          }}
        />
      )}

      <header className="mb-12">
        <h1 className="font-heading text-5xl text-white">Your Common Room</h1>
        <p className="text-parchment/70 mt-2 text-lg">Manage your magical creations and organize assemblies.</p>
      </header>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left column for actions */}
        <motion.div className="lg:col-span-1 space-y-8" variants={itemVariants}>
          {/* Panel for Uploading Art */}
          <div className="bg-ink-black p-6 rounded-lg border border-parchment/10">
            <h2 className="font-heading text-2xl mb-4 text-parchment">Enchant a New Portrait</h2>
            <ArtworkUploadForm />
          </div>
          
          {/* Panel for Managing Events */}
          {profile?.can_create_events && (
            <div className="bg-ink-black p-6 rounded-lg border border-parchment/10">
              <h2 className="font-heading text-2xl mb-4 text-parchment">Your Assemblies</h2>
              <button 
                  onClick={() => setShowCreateEventModal(true)} 
                  className="w-full py-3 px-4 bg-spell-glow-teal/80 text-ink-black font-body font-bold rounded-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-spell-glow-teal transition-all mb-4"
              >
                  + Host a New Assembly
              </button>
              <div className='space-y-2'>
                  {loadingEvents ? ( <p className='text-parchment/70'>Summoning records...</p> ) 
                    : myEvents.length > 0 ? (
                      myEvents.map(event => ( <div key={event.id} className='text-parchment p-3 bg-stone-dark rounded-sm font-body'>{event.title}</div> ))
                    ) : ( <p className='text-parchment/70 italic'>You are not hosting any assemblies.</p> )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right column for the Artworks Gallery */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <div className="bg-ink-black p-6 rounded-lg border border-parchment/10 min-h-full">
            <h2 className="font-heading text-2xl mb-4 text-parchment">Your Portrait Gallery</h2>
            {loadingArt ? (
              <p className="text-center text-parchment/70">Polishing the frames...</p>
            ) : myArtworks.length === 0 ? (
              <div className="text-center text-parchment/50 h-48 flex items-center justify-center p-4 bg-stone-dark/50 rounded-md">
                <p>Your gallery awaits its first masterpiece.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myArtworks.map(artwork => ( <ArtworkCard key={artwork.id} artwork={artwork} /> ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;