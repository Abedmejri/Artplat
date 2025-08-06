// src/components/ProfileDropdown.tsx

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useProfile } from '../hooks/useProfile';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileDropdown = () => {
  const profile = useProfile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  const itemClasses = "block w-full text-left px-4 py-2 text-parchment/80 hover:bg-ink-black/50 hover:text-white";

  if (!profile) return null; // Don't render if not logged in

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-3 group">
        <img
          src={profile.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
          alt={profile.username || 'user avatar'}
          className="w-12 h-12 rounded-full border-2 border-parchment/20 group-hover:border-spell-glow-teal transition-colors"
        />
        <div className="hidden md:block text-left">
          <p className="font-bold text-white whitespace-nowrap">{profile.username}</p>
          <p className="text-sm text-parchment/60 whitespace-nowrap">View Options</p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute bottom-full mb-4 w-56 bg-stone-dark rounded-md shadow-2xl border border-parchment/10 py-2"
          >
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className={itemClasses}>Common Room</Link>
            <Link to="/settings" onClick={() => setIsOpen(false)} className={itemClasses}>Settings</Link>
            <div className="my-2 border-t border-parchment/10"></div>
            <button onClick={handleSignOut} className={`${itemClasses} text-gryffindor-red`}>Depart</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;