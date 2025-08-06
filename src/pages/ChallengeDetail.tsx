// src/pages/ChallengeDetail.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ArtworkCard, { type Artwork } from '../components/ArtworkCard';

interface Challenge {
  title: string;
  theme: string | null;
}

const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchChallengeDetails = async () => {
      setLoading(true);

      // Fetch challenge info
      const { data: challengeData } = await supabase
        .from('challenges')
        .select('title, theme')
        .eq('id', id)
        .single();
      if (challengeData) setChallenge(challengeData);

      // Fetch all submissions for this challenge, and join to get artwork details
      const { data: submissionData, error } = await supabase
        .from('submissions')
        .select('artworks(*, profiles(username))')
        .eq('challenge_id', id);

      if (error) {
        console.error('Error fetching submissions:', error);
      } else if (submissionData) {
        // The data is nested, so we need to extract it
        const artworkList = submissionData.map(s => s.artworks).filter(Boolean) as unknown as Artwork[];
        setSubmissions(artworkList);
      }
      setLoading(false);
    };
    fetchChallengeDetails();
  }, [id]);

  if (loading) return <p className="text-center text-parchment p-10">Gathering the entries...</p>;
  
  return (
    <div className="container mx-auto p-4 md:p-8 font-serif">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-parchment">{challenge?.title}</h1>
        <p className="text-lg text-gold italic mt-1">{challenge?.theme}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {submissions.map(artwork => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>

      {!loading && submissions.length === 0 && (
        <div className="text-center text-wood p-10 bg-parchment/80 rounded-sm">
            No submissions have been made for this challenge yet.
        </div>
      )}
    </div>
  );
};

export default ChallengeDetail;