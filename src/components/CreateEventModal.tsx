// src/components/CreateEventModal.tsx

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import { motion } from 'framer-motion';

interface CreateEventModalProps {
  onClose: () => void;
  onEventCreated: () => void; // A function to refresh the event list
}

const CreateEventModal = ({ onClose, onEventCreated }: CreateEventModalProps) => {
  const session = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setError('You must be logged in to host an assembly.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('events').insert({
      organizer_id: session.user.id,
      title,
      description,
      location,
      start_date: new Date(startDate).toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      onEventCreated(); // Refresh the list on the dashboard
      onClose(); // Close the modal
    }
    setLoading(false);
  };

  // Styles consistent with the "Modern Wizarding World" theme
  const inputStyles = "w-full px-4 py-3 bg-stone-dark rounded-sm border border-parchment/20 focus:outline-none focus:ring-2 focus:ring-spell-glow-teal text-parchment font-body placeholder-parchment/50";
  const buttonStyles = "w-full py-3 px-4 bg-spell-glow-teal text-ink-black font-body font-bold rounded-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-white transition-all disabled:opacity-50";

  return (
    // Modal Backdrop
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ink-black/80 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      {/* Modal Panel */}
      <motion.div 
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        className="bg-stone-dark w-full max-w-lg p-8 rounded-lg shadow-2xl border-2 border-parchment/10 m-4"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading text-3xl text-white">Proclaim a New Assembly</h2>
          <button onClick={onClose} className="text-parchment/70 hover:text-white text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-gryffindor-red text-center">{error}</p>}
          
          <div>
            <label htmlFor="title" className="block text-parchment/80 mb-1">Title of the Assembly</label>
            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className={inputStyles} />
          </div>

          <div>
            <label htmlFor="description" className="block text-parchment/80 mb-1">Description</label>
            <textarea id="description" placeholder="Describe the purpose of your gathering..." value={description} onChange={e => setDescription(e.target.value)} required rows={4} className={inputStyles} />
          </div>

          <div>
            <label htmlFor="location" className="block text-parchment/80 mb-1">Location</label>
            <input id="location" type="text" placeholder="e.g., 'The Great Hall' or 'Online via Floo Network'" value={location} onChange={e => setLocation(e.target.value)} required className={inputStyles} />
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-parchment/80 mb-1">Date and Time</label>
            <input id="startDate" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required className={inputStyles} />
          </div>

          <button type="submit" disabled={loading} className={buttonStyles}>
            {loading ? 'Proclaiming...' : 'Proclaim Assembly'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateEventModal;