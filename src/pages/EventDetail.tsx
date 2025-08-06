// src/pages/EventDetail.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import RsvpButton from '../components/RsvpButton';

interface EventWithOrganizer {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  profiles: {
    username: string | null;
  } | null;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventWithOrganizer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*, profiles(username)')
        .eq('id', id)
        .single();
      
      if (error) console.error("Error fetching event details:", error);
      else setEvent(data as EventWithOrganizer);
      setLoading(false);
    };
    fetchEvent();
  }, [id]);
  
  if (loading) return <p className="text-center text-parchment p-10">Unfurling the proclamation...</p>;
  if (!event) return <p className="text-center text-parchment p-10">This event could not be found in the archives.</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto"
    >
      <div className="bg-ink-black p-8 rounded-lg border border-parchment/10 shadow-2xl max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="border-b border-parchment/10 pb-6 mb-6 text-center">
          <p className="font-body text-spell-glow-teal text-lg">
            An Assembly on {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </p>
          <h1 className="font-heading text-5xl sm:text-7xl text-white mt-2">{event.title}</h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left/Main Column: Description */}
          <div className="md:col-span-2">
            <h2 className="font-heading text-3xl text-parchment mb-4">The Proclamation</h2>
            <p className="font-body text-parchment/80 text-lg leading-relaxed whitespace-pre-wrap">
              {event.description || 'No further details have been provided for this assembly.'}
            </p>
          </div>

          {/* Right/Sidebar Column: Info & RSVP */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-stone-dark/50 p-6 rounded-md border border-parchment/10">
              <h3 className="font-heading text-xl text-parchment/80 mb-3">Location</h3>
              <p className="font-body text-white text-2xl">{event.location}</p>
            </div>
            <div className="bg-stone-dark/50 p-6 rounded-md border border-parchment/10">
              <h3 className="font-heading text-xl text-parchment/80 mb-3">Organizer</h3>
              <Link to={`/profile/${event.profiles?.username}`} className="font-body text-white text-2xl hover:text-spell-glow-teal transition-colors">
                {event.profiles?.username || 'A mysterious host'}
              </Link>
            </div>
            
            {/* RSVP Button */}
            <RsvpButton eventId={event.id} />

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventDetail;