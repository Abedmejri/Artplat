// src/pages/Challenges.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Define the shape of our challenge data
interface Challenge {
  id: number;
  title: string;
  theme: string | null;
  description: string | null;
  deadline: string | null;
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

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('deadline', { ascending: true });
        
      if (error) {
        console.error('Error fetching challenges:', error);
      } else {
        setChallenges(data as Challenge[]);
      }
      setLoading(false);
    };
    fetchChallenges();
  }, []);

  if (loading) return <p className="text-center text-parchment p-10">Consulting the Goblet of Fire for active duels...</p>;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center my-12"
      >
        <h1 className="font-heading text-6xl text-white tracking-wider text-shadow-glow">
          The Dueling Club
        </h1>
        <p className="font-body text-parchment/70 mt-4 text-lg max-w-2xl mx-auto">
          Prove your artistic mettle. Answer the challenge and submit your finest work for judgment.
        </p>
      </motion.header>

      {challenges.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-parchment/80 p-10 bg-stone-dark/50 rounded-lg border border-parchment/10"
        >
          The dueling grounds are quiet. No new challenges have been declared.
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-4xl mx-auto"
        >
          {challenges.map(challenge => (
            <motion.div key={challenge.id} variants={itemVariants}>
              <Link to={`/challenges/${challenge.id}`} className="block group">
                <div className="bg-stone-dark/50 p-6 rounded-lg border border-parchment/10 shadow-lg group-hover:border-spell-glow-teal group-hover:shadow-glow-teal transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <h2 className="font-heading text-3xl text-white mt-1 group-hover:text-spell-glow-teal transition-colors">{challenge.title}</h2>
                      <p className="font-body text-lg text-parchment/80 italic mt-1">{challenge.theme}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 text-left sm:text-right">
                       <p className="font-body text-parchment/60">Submissions Due:</p>
                       <p className="font-body text-parchment text-xl">
                         {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'}) : 'Ongoing'}
                       </p>
                    </div>
                  </div>
                  <p className="font-body text-parchment/70 mt-4 pt-4 border-t border-parchment/10">
                    {challenge.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
};

export default Challenges;