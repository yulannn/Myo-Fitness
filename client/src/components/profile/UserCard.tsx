import { useRef, useState } from 'react';
import { useUploadProfilePicture } from '../../api/hooks/user/useUploadProfilePicture';
import { CameraIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { getImageUrl, validateImageFile } from '../../utils/imageUtils';

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

    // Validation avec l'utilitaire
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.errorMessage);
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
    <div className="relative bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Profile Picture */}
          <div className="relative group flex-shrink-0">
            <div className="relative h-28 w-28 md:h-32 md:w-32">
              <img
                src={getImageUrl(profilePictureUrl)}
                alt={name}
                className="h-full w-full rounded-2xl object-cover ring-2 ring-white/10 shadow-xl"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#94fbdd] border-t-transparent"></div>
                </div>
              )}

              <button
                type="button"
                onClick={handleOpenFilePicker}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-[#27272a] text-white border border-white/10 shadow-lg hover:bg-[#3f3f46] hover:text-[#94fbdd] transition-all group-hover:scale-105"
                title="Modifier la photo"
              >
                <CameraIcon className="h-4 w-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mt-1">
                <EnvelopeIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{email}</span>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
              <div className="px-3 py-1 bg-[#94fbdd]/10 border border-[#94fbdd]/20 rounded-lg flex items-center gap-2">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#94fbdd] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#94fbdd]"></span>
                </span>
                <span className="text-xs font-semibold text-[#94fbdd] uppercase tracking-wide">En ligne</span>
              </div>
              <div className="px-3 py-1 bg-[#27272a] border border-white/5 rounded-lg flex items-center gap-2">
                <UserCircleIcon className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-300">Membre actif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
