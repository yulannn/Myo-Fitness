import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFitnessProfilesByUser } from '../../api/hooks/fitness-profile/useGetFitnessProfilesByUser';
import { useCreateFitnessProfile } from '../../api/hooks/fitness-profile/useCreateFitnessProfile';
import { useUpdateFitnessProfile } from '../../api/hooks/fitness-profile/useUpdateFitnessProfile';
import UserCard from '../../components/profile/UserCard';
import FitnessProfilesList from '../../components/profile/FitnessProfilesList';
import CreateProfileModal from '../../components/profile/CreateProfileModal';
import EditProfileModal from '../../components/profile/EditProfileModal';
import type { FitnessProfile } from '../../types/fitness-profile.type';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function FitnessProfiles() {
  const { user, logout } = useAuth();
  const { data: profiles, isLoading } = useFitnessProfilesByUser();

  const createMutation = useCreateFitnessProfile();
  const updateMutation = useUpdateFitnessProfile();

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
    if (!profileToEdit) return;

    updateMutation.mutate(
      { id: profileToEdit.id, ...form },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setProfileToEdit(null);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#2F4858] to-[#7CD8EE] text-white p-6 shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Mon Profil</h1>
            <p className="text-white/80 text-sm">Gérez vos informations et objectifs</p>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            title="Se déconnecter"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6 mt-4">
        {/* USER CARD */}
        <section>
          <UserCard
            name={user?.name || 'John Doe'}
            email={user?.email || 'email@example.com'}
            profilePictureUrl={user?.profilePictureUrl || undefined}
          />
        </section>

        {/* FITNESS PROFILES */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <UserIcon className="h-5 w-5 text-[#2F4858]" />
            <h2 className="text-lg font-bold text-[#2F4858]">Profil Fitness</h2>
          </div>

          <FitnessProfilesList
            profiles={profiles || undefined}
            isLoading={isLoading}
            onAddClick={() => setIsCreateModalOpen(true)}
            onEditClick={handleEdit}
          />
        </section>
      </div>

      {/* CREATE MODAL */}
      <CreateProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      {/* EDIT MODAL */}
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
    </div>
  );
}
