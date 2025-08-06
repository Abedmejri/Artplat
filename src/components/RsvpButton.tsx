// src/components/RsvpButton.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';

interface RsvpButtonProps {
  eventId: number;
}

const RsvpButton = ({ eventId }: RsvpButtonProps) => {
  const session = useSession();
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRsvpStatus = async () => {
      setLoading(true);
      // Get total number of attendees
      const { count, error: countError } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      
      if (count !== null) setAttendeeCount(count);

      // Check if the current user is attending
      if (session?.user) {
        const { data: rsvpData, error: userRsvpError } = await supabase
          .from('event_attendees')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', session.user.id)
          .single();
        
        if (rsvpData) setIsAttending(true);
      }
      setLoading(false);
    };
    fetchRsvpStatus();
  }, [eventId, session]);

  const handleRsvp = async () => {
    if (!session?.user) {
      alert('You must be logged in to RSVP.');
      return;
    }

    if (isAttending) {
      // Cancel RSVP
      setIsAttending(false);
      setAttendeeCount(prev => prev - 1);
      await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', session.user.id);
    } else {
      // RSVP to event
      setIsAttending(true);
      setAttendeeCount(prev => prev + 1);
      await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: session.user.id });
    }
  };

  const buttonStyles = `w-full py-3 px-4 font-body font-bold rounded-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-wait`;
  const attendingStyles = `bg-gryffindor-red/80 text-parchment hover:bg-gryffindor-red ${buttonStyles}`;
  const rsvpStyles = `bg-spell-glow-teal text-ink-black shadow-spell-glow-teal/20 hover:bg-white ${buttonStyles}`;
  
  if (!session) {
    return (
      <div className="text-center p-4 bg-stone-dark/50 rounded-md border border-parchment/10 text-parchment/70">
        Log in to RSVP
      </div>
    );
  }

  return (
    <button onClick={handleRsvp} disabled={loading} className={isAttending ? attendingStyles : rsvpStyles}>
      {loading ? 'Checking scroll...' : isAttending ? 'Cancel RSVP' : `RSVP (${attendeeCount} Attending)`}
    </button>
  );
};

export default RsvpButton;