// src/pages/Settings.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProfile } from '../hooks/useProfile';
import { motion } from 'framer-motion';

const Settings = () => {
  const profile = useProfile();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [donationUrl, setDonationUrl] = useState('');
  const [message, setMessage] = useState('');

  // This effect runs when the profile data is loaded, populating the form
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setWebsite(profile.website || '');
      setBio(profile.bio || '');
      setDonationUrl(profile.donation_url || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!profile) {
      setMessage('Error: Profile not loaded.');
      setLoading(false);
      return;
    }

    // Prepare the data for updating. We don't include `updated_at` here
    // because the database trigger will handle it automatically.
    const updates = {
      id: profile.id, // The user's ID to identify which row to update
      username,
      website,
      bio,
      donation_url: donationUrl,
    };

    // Use `upsert` to update the profile. It will create a row if one doesn't exist,
    // or update it if it does, based on the `id`.
    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      setMessage('Error updating profile: ' + error.message);
    } else {
      setMessage('Profile successfully updated!');
    }
    setLoading(false);
  };
  
  // Styles consistent with the "Modern Wizarding World" theme
  const inputStyles = "w-full px-4 py-3 bg-stone-dark rounded-sm border border-parchment/20 focus:outline-none focus:ring-2 focus:ring-spell-glow-teal text-parchment font-body placeholder-parchment/50";
  const buttonStyles = "py-2 px-5 bg-spell-glow-teal text-ink-black font-body font-bold rounded-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-white transition-all disabled:opacity-50";

  if (!profile) {
    return <p className="text-center text-parchment p-10">Loading your settings...</p>;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading text-5xl text-white">Your Profile Settings</h1>
        <p className="font-body text-parchment/70 mt-2">Update your public information and donation link.</p>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl bg-stone-dark/50 p-8 rounded-lg border border-parchment/10"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-parchment/80 mb-1">Username</label>
            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputStyles} />
          </div>
          <div>
            <label htmlFor="bio" className="block text-parchment/80 mb-1">Bio</label>
            <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} className={inputStyles} placeholder="Tell the world about your art..." />
          </div>
          <div>
            <label htmlFor="website" className="block text-parchment/80 mb-1">Website URL</label>
            <input id="website" type="url" value={website} onChange={e => setWebsite(e.target.value)} className={inputStyles} placeholder="https://..." />
          </div>
          <div>
            <label htmlFor="donationUrl" className="block text-parchment/80 mb-1">Donation Link (e.g., Ko-fi, PayPal.Me)</label>
            <input id="donationUrl" type="url" value={donationUrl} onChange={e => setDonationUrl(e.target.value)} className={inputStyles} placeholder="https://..." />
          </div>
          <div>
            <button type="submit" disabled={loading} className={buttonStyles}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          {message && <p className="text-spell-glow-teal mt-4">{message}</p>}
        </form>
      </motion.div>
    </main>
  );
};

export default Settings;