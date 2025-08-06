// src/components/ArtworkUploadForm.tsx

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../lib/supabaseClient';

// Prop to allow the parent (Dashboard) to refresh after a successful upload
interface ArtworkUploadFormProps {
  onUploadSuccess?: () => void; // Optional callback
}

const ArtworkUploadForm = ({ onUploadSuccess }: ArtworkUploadFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Added description field
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setSuccess(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to enchant a portrait.");
      if (!file) throw new Error("Please select a portrait file to enchant.");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('artworks').insert({
        user_id: user.id,
        title,
        description,
        media_url: urlData.publicUrl,
      });

      if (insertError) throw insertError;

      setSuccess('Your portrait has been successfully enchanted and hung in the gallery!');
      if (onUploadSuccess) {
        onUploadSuccess(); // Call the callback to refresh the dashboard
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);

    } catch (error: any) {
      setError(error.message || 'A mysterious force prevented the enchantment.');
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };
  
  const inputStyles = "w-full px-4 py-3 bg-stone-dark rounded-sm border border-parchment/20 focus:outline-none focus:ring-2 focus:ring-spell-glow-teal text-parchment font-body placeholder-parchment/50";
  const buttonStyles = "w-full py-3 px-4 bg-spell-glow-teal text-ink-black font-body font-bold rounded-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      {error && <div className="p-3 text-center bg-gryffindor-red/20 text-parchment font-bold rounded-sm border border-gryffindor-red/50">{error}</div>}
      {success && <div className="p-3 text-center bg-spell-glow-teal/20 text-parchment font-bold rounded-sm border border-spell-glow-teal/50">{success}</div>}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-parchment/80 mb-1">Portrait Title</label>
        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className={inputStyles} />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-parchment/80 mb-1">Artist's Notes (Optional)</label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputStyles} />
      </div>

      <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${isDragActive ? 'border-spell-glow-teal bg-spell-glow-teal/10' : 'border-parchment/20 hover:border-spell-glow-teal'}`}>
        <input {...getInputProps()} />
        <p className="text-parchment/70">
          {isDragActive ? "Release the image file here..." : "Drag & drop your portrait here, or click to summon it"}
        </p>
        {file && <p className="text-sm text-spell-glow-teal font-semibold pt-2">{file.name}</p>}
      </div>

      <button type="submit" disabled={uploading || !file} className={buttonStyles}>
        {uploading ? 'Enchanting...' : 'Enchant Portrait'}
      </button>
    </form>
  );
};

export default ArtworkUploadForm;