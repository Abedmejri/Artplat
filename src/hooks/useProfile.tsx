// src/hooks/useProfile.tsx

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from './useSession';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  can_create_events: boolean; // Our new permission flag!
}

const ProfileContext = createContext<Profile | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setProfile(data as Profile);
        }
      };
      fetchProfile();
    } else {
      // If user logs out, clear the profile
      setProfile(null);
    }
  }, [session]);

  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};