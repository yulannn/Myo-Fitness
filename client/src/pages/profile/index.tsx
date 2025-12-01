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
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-[#121214] pb-24">
      {/* Logout Button - Floating */}
      <button
        onClick={logout}
        className="fixed top-6 right-6 z-30 p-3 bg-[#252527] hover:bg-[#94fbdd]/10 border border-[#94fbdd]/20 rounded-xl transition-all group shadow-lg"
        title="Se déconnecter"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd] transition-colors" />
      </button>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        {/* USER CARD - Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#94fbdd]/5 to-transparent rounded-3xl blur-3xl"></div>
          <UserCard
            name={user?.name || 'John Doe'}
            email={user?.email || 'email@example.com'}
            profilePictureUrl={user?.profilePictureUrl || undefined}
          />
        </section>

        {/* FITNESS PROFILES - Main Content */}
        <section className="relative">
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
