// src/components/UserCard.tsx
import { useRef, useState } from 'react';
import { useUploadProfilePicture } from '../../api/hooks/user/useUploadProfilePicture';
import { Pencil } from 'lucide-react';

interface UserCardProps {
  name: string;
  email: string;
  profilePictureUrl?: string;
}

export default function UserCard({ name, email, profilePictureUrl }: UserCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadProfilePicture();

  const handleOpenFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop lourde (max 5 Mo)');
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl bg-gradient-to-br from-[#2F4858] to-[#1f3340] p-4 shadow-xl border border-[#2F4858]/30 flex items-center gap-5">
      <div className="relative">
        <img
          src={`http://localhost:3000${profilePictureUrl ?? '/uploads/profile-pictures/default.png'}`}
          alt={name}
          className="h-20 w-20 rounded-full object-cover ring-4 ring-[#7CD8EE]/50 shadow-md"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleOpenFilePicker}
          className="
            absolute bottom-0 right-0 h-6 w-6 rounded-full 
            bg-[#642f00] text-white flex items-center justify-center shadow-lg 
            hover:bg-[#8b4c00] transition
          "
          title="Changer la photo"
        >
          <Pencil size={12} />
        </button>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      <div>
        <p className="text-xl font-bold text-white">{name}</p>
        <p className="text-sm text-[#7CD8EE]">{email}</p>
      </div>
    </div>
  );
}
