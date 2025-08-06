// src/pages/AuthPage.tsx

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

type AuthMode = 'signIn' | 'signUp' | 'forgotPassword';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'signUp') {
      if (password !== confirmPassword) {
        setError('The incantations do not match. (Passwords must be the same)');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username } }
      });
      if (error) setError(error.message);
      else setMessage('An owl has been dispatched to your email. Please confirm your identity.');

    } else if (mode === 'signIn') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      // Note: Redirection is handled automatically by the logic in App.tsx

    } else if (mode === 'forgotPassword') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) setError(error.message);
      else setMessage('A memory charm has been sent to your email to help you recall your password.');
    }

    setLoading(false);
  };

  const inputStyles = "w-full px-4 py-3 bg-stone-dark/50 border border-parchment/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-spell-glow-teal text-parchment font-body placeholder-parchment/50";
  const buttonStyles = "w-full py-3 px-4 bg-spell-glow-teal text-ink-black font-body font-bold rounded-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="font-body flex justify-center items-center min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 space-y-6 bg-stone-dark/70 backdrop-blur-md rounded-lg shadow-2xl border border-parchment/10"
      >
        <div className="text-center">
          <h1 className="font-heading text-5xl font-bold text-white">ArtHive</h1>
          <p className="text-parchment/70 mt-2">
            {mode === 'signIn' ? 'Present your credentials to enter.' :
             mode === 'signUp' ? 'Enroll in the gallery of magic.' : 'Seek assistance from the keepers.'}
          </p>
        </div>
        
        {error && <div className="p-3 text-center bg-gryffindor-red/20 text-parchment font-bold rounded-sm border border-gryffindor-red/50">{error}</div>}
        {message && <div className="p-3 text-center bg-spell-glow-teal/20 text-parchment font-bold rounded-sm border border-spell-glow-teal/50">{message}</div>}

        <form onSubmit={handleAuthAction} className="space-y-4">
          {mode === 'signUp' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <input type="text" placeholder="Your Chosen Name" value={username} onChange={e => setUsername(e.target.value)} required className={inputStyles} />
            </motion.div>
          )}
          <input type="email" placeholder="Your Email Address" value={email} onChange={e => setEmail(e.target.value)} required className={inputStyles} />
          {mode !== 'forgotPassword' && (
            <input type="password" placeholder="Your Secret Word" value={password} onChange={e => setPassword(e.target.value)} required className={inputStyles} />
          )}
          {mode === 'signUp' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <input type="password" placeholder="Confirm the Secret Word" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputStyles} />
            </motion.div>
          )}
          <button type="submit" disabled={loading} className={buttonStyles}>
            {loading ? 'Casting Spell...' : 
              mode === 'signIn' ? 'Enter the Gallery' : 
              mode === 'signUp' ? 'Complete Enrollment' : 'Send Help'}
          </button>
        </form>

        <div className="text-center text-sm text-parchment/60">
          {mode === 'signIn' && (
            <p>Not yet enrolled? <button onClick={() => setMode('signUp')} className="font-bold hover:underline text-spell-glow-teal">Sign Up</button></p>
          )}
          {mode === 'signUp' && (
            <p>Already a member? <button onClick={() => setMode('signIn')} className="font-bold hover:underline text-spell-glow-teal">Sign In</button></p>
          )}
          <button onClick={() => setMode('forgotPassword')} className="mt-2 font-bold hover:underline text-parchment/50">Forgot Secret Word?</button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;