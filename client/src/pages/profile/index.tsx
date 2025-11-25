// src/pages/FitnessProfiles.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLogout } from '../../api/hooks/auth/useLogout';
import { useFitnessProfilesByUser } from '../../api/hooks/fitness-profile/useGetFitnessProfilesByUser';
import { useCreateFitnessProfile } from '../../api/hooks/fitness-profile/useCreateFitnessProfile';
import { useUpdateFitnessProfile } from '../../api/hooks/fitness-profile/useUpdateFitnessProfile';
import UserCard from '../../components/profile/UserCard';
import FitnessProfilesList from '../../components/profile/FitnessProfilesList';
import CreateProfileModal from '../../components/profile/CreateProfileModal';
import EditProfileModal from '../../components/profile/EditProfileModal';
import type { FitnessProfile } from '../../types/fitness-profile.type';

export default function FitnessProfiles() {
  const { user } = useAuth();
  const logout = useLogout();
  const { data: profiles, isLoading } = useFitnessProfilesByUser();
  const createMutation = useCreateFitnessProfile();
  const updateMutation = useUpdateFitnessProfile(profiles?.id);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<FitnessProfile | null>(null);

  const handleCreate = (form: any) => {
    createMutation.mutate(form, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleEdit = (profile: FitnessProfile) => {
    setProfileToEdit(profile);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (form: any) => {
    updateMutation.mutate(form, {
      onSuccess: () => {
        setIsEditModalOpen(false);
        setProfileToEdit(null);
      },
    });
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
          onEditClick={handleEdit}
        />
      </div>

      <CreateProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProfileToEdit(null);
        }}
        onSubmit={handleUpdate}
        isPending={updateMutation.isPending}
        profile={profileToEdit}
      />
    </section>
  );
}
