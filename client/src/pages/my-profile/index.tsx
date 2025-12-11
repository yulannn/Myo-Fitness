import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFitnessProfilesByUser } from '../../api/hooks/fitness-profile/useGetFitnessProfilesByUser';
import { useCreateFitnessProfile } from '../../api/hooks/fitness-profile/useCreateFitnessProfile';
import { useUpdateFitnessProfile } from '../../api/hooks/fitness-profile/useUpdateFitnessProfile';
import UserCard from '../../components/profile/UserCard';
import FitnessProfilesList from '../../components/profile/FitnessProfilesList';
import CreateProfileModal from '../../components/profile/CreateProfileModal';
import EditProfileModal from '../../components/profile/EditProfileModal';
import XpBar from '../../components/common/XpBar';
import type { FitnessProfile } from '../../types/fitness-profile.type';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function FitnessProfiles() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      {/* Back Button - Floating */}
      {/* Back Button - Minimalist */}
      <button
        onClick={() => navigate('/settings')}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Retour</span>
      </button>

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8 md:py-12 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8">

        {/* Left Column: User Info & XP (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <section>
            <UserCard
              name={user?.name || 'John Doe'}
              email={user?.email || 'email@example.com'}
              profilePictureUrl={user?.profilePictureUrl || undefined}
            />
          </section>

          <section>
            <h3 className="text-sm font-medium text-gray-400 mb-2 px-1">Niveau & Progression</h3>
            <XpBar variant="compact" showLevel={true} />
          </section>
        </div>

        {/* Right Column: Fitness Profile (8 cols) */}
        <div className="md:col-span-8">
          <FitnessProfilesList
            profiles={profiles || undefined}
            isLoading={isLoading}
            onAddClick={() => setIsCreateModalOpen(true)}
            onEditClick={handleEdit}
          />
        </div>
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
