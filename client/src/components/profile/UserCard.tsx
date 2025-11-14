// src/components/UserCard.tsx
import { useRef, useState } from 'react';
import { useUploadProfilePicture } from '../../api/hooks/useUploadProfilePicture';
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
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <img
            src={`http://localhost:3000${profilePictureUrl ?? '/uploads/profile-pictures/default.png'}`}
            alt={name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200"
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
            className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-black text-white flex items-center justify-center shadow-md focus:outline-none"
            title="Changer la photo"
          >
            <Pencil size={10} />
          </button>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">{email}</p>
        </div>
      </div>
    </div>
  );
}