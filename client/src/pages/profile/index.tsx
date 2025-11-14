// src/pages/FitnessProfiles.tsx
import { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLogout } from '../../api/hooks/useLogout';
import { useUploadProfilePicture } from '../../api/hooks/useUploadProfilePicture';
import { Pencil } from 'lucide-react';

export default function FitnessProfiles() {
  const { user } = useAuth();
  const logout = useLogout();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadProfilePicture();

  console.log(user)
  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

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
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Profil</h1>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Déconnexion
        </button>
      </div>

      {/* Profil */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4 relative">
          <div className="relative">

            {/* IMAGE */}
            <img
              src={`http://localhost:3000${user?.profilePictureUrl ?? '/uploads/profile-pictures/default.png'}`}
              alt={user?.name ?? "John Doe"}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200"
            />

            {/* INPUT FILE (toujours enabled) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Bouton pour ouvrir le picker */}
            <button
              type="button"
              onClick={handleOpenFilePicker}
              className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-black text-white flex items-center justify-center shadow-md focus:outline-none"
              title="Changer la photo"
            >
              <Pencil size={10} />
            </button>

            {/* Overlay de chargement */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.name || "John Doe"}</p>
            <p className="text-sm text-slate-500">{user?.email || "email@example.com"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
