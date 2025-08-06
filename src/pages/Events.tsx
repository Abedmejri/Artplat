// src/pages/Events.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Define the shape of our event data
interface EventWithOrganizer {
  id: number;
  title: string;
  location: string | null;
  start_date: string;
  // Change this to an array of objects
  profiles: {
    username: string | null;
  }[] | null;
}

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Events = () => {
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`id, title, location, start_date, profiles(username)`)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data as EventWithOrganizer[]);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) return <p className="text-center text-parchment p-10">Consulting the enchanted calendar...</p>;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center my-12"
      >
        <h1 className="font-heading text-6xl text-white tracking-wider text-shadow-glow">
          The Notice Board
        </h1>
        <p className="font-body text-parchment/70 mt-4 text-lg max-w-2xl mx-auto">
          Upcoming assemblies, exhibitions, and magical gatherings from across the community.
        </p>
      </motion.header> {/* 👈 This was the line to fix */}

      {events.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-ink-black p-10 bg-parchment/80 rounded-md"
        >
          The notice board is currently clear. No new assemblies have been announced.
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-4xl mx-auto"
        >
          {events.map(event => (
            <motion.div key={event.id} variants={itemVariants}>
              <Link to={`/events/${event.id}`} className="block group">
                <div className="bg-stone-dark/50 p-6 rounded-lg border border-parchment/10 shadow-lg group-hover:border-spell-glow-teal group-hover:shadow-glow-teal transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <p className="font-body text-sm text-spell-glow-teal">
                        {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <h2 className="font-heading text-3xl text-white mt-1 group-hover:text-spell-glow-teal transition-colors">{event.title}</h2>
                    </div>
                    <div className="mt-4 sm:mt-0 text-right">
                       <p className="font-body text-parchment/60">Location:</p>
                       <p className="font-body text-parchment text-xl">{event.location || 'Undisclosed'}</p>
                    </div>
                  </div>
                  <p>Organized by: <span className="italic">{event.profiles?.[0]?.username || 'a secret host'}</span></p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
};

export default Events;