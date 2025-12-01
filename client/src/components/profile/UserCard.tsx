import { useRef, useState } from 'react';
import { useUploadProfilePicture } from '../../api/hooks/user/useUploadProfilePicture';
import { CameraIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

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
      alert(err.message || 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative bg-[#252527] rounded-3xl shadow-2xl overflow-hidden border border-[#94fbdd]/10">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#94fbdd]/10 to-transparent rounded-full blur-3xl"></div>

      <div className="relative p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Profile Picture */}
          <div className="relative group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#94fbdd] to-[#94fbdd]/50 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src={`http://localhost:3000${profilePictureUrl ?? '/uploads/profile-pictures/default.png'}`}
                alt={name}
                className="relative h-32 w-32 rounded-3xl object-cover ring-4 ring-[#94fbdd]/20 shadow-2xl"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/70 backdrop-blur-sm">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#94fbdd] border-t-transparent"></div>
                </div>
              )}
            </div>

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
              className="absolute -bottom-3 -right-3 h-12 w-12 rounded-2xl bg-[#94fbdd] text-[#121214] flex items-center justify-center shadow-xl hover:bg-[#94fbdd]/90 transition-all active:scale-95 group"
              title="Changer la photo"
            >
              <CameraIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                <EnvelopeIcon className="h-5 w-5" />
                <p className="text-base">{email}</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="px-4 py-2 bg-[#121214] border border-[#94fbdd]/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <UserCircleIcon className="h-5 w-5 text-[#94fbdd]" />
                  <span className="text-sm font-medium text-white">Membre actif</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-[#94fbdd]/10 border border-[#94fbdd]/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#94fbdd] animate-pulse"></span>
                  <span className="text-sm font-medium text-[#94fbdd]">En ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
