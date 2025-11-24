// src/pages/FitnessProfiles.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLogout } from '../../api/hooks/auth/useLogout';
import { useFitnessProfilesByUser } from '../../api/hooks/fitness-profile/useGetFitnessProfilesByUser';
import { useCreateFitnessProfile } from '../../api/hooks/fitness-profile/useCreateFitnessProfile';
import { useDeleteFitnessProfile } from '../../api/hooks/fitness-profile/useDeleteFitnessProfile';
import UserCard from '../../components/profile/UserCard';
import FitnessProfilesList from '../../components/profile/FitnessProfilesList';
import CreateProfileModal from '../../components/profile/CreateProfileModal';
import DeleteProfileModal from '../../components/profile/DeleteProfileModal';
import { Plus } from "lucide-react";

export default function FitnessProfiles() {
  const { user } = useAuth();
  const logout = useLogout();
  const { data: profiles, isLoading } = useFitnessProfilesByUser();
  const createMutation = useCreateFitnessProfile();
  const deleteMutation = useDeleteFitnessProfile();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);

  const handleCreate = (form: any) => {
    createMutation.mutate(form, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleDelete = (id: number) => setProfileToDelete(id);

  const confirmDelete = () => {
    if (profileToDelete !== null) {
      deleteMutation.mutate(profileToDelete, {
        onSuccess: () => setProfileToDelete(null),
      });
    }
  };

  return (
    <section className="min-h-screen bg-[#2F4858] px-4 pt-6 pb-28 max-w-3xl mx-auto space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#7CD8EE]">Mon Profil</h1>
        <button
          onClick={logout}
          className="rounded-xl bg-[#642f00] text-white px-4 py-2 font-semibold shadow-md hover:bg-[#8b4c00] transition active:scale-95"
        >
          Déconnexion
        </button>
      </div>

      <div className="bg-[#1f3340] p-4 rounded-xl shadow-xl">
        <UserCard
          name={user?.name || 'John Doe'}
          email={user?.email || 'email@example.com'}
          profilePictureUrl={user?.profilePictureUrl || undefined}
        />
      </div>

      <div className="bg-[#1f3340] p-4 rounded-xl shadow-xl">
        <FitnessProfilesList
          profiles={profiles || undefined}
          isLoading={isLoading}
          onAddClick={() => setIsCreateModalOpen(true)}
          onDeleteClick={handleDelete}
        />
      </div>

      <CreateProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      <DeleteProfileModal
        isOpen={profileToDelete !== null}
        onClose={() => setProfileToDelete(null)}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </section>
  );
}
