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

export default function FitnessProfiles() {
  const { user } = useAuth();
  const { data: profiles, isLoading } = useFitnessProfilesByUser();
  const createMutation = useCreateFitnessProfile();
  const updateMutation = useUpdateFitnessProfile(profiles?.id);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<FitnessProfile | null>(
    null,
  );

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
    <section className="min-h-screen bg-black px-4 pt-6 pb-28 max-w-3xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-[#FFFFFF] font-bold montserrat-500">
          MON PROFIL FITNESS
        </h1>
      </div>

      <hr className="border-t border-gray-600/30" />

      {/* USER CARD */}
      <div className="bg-[#46E1D3]/60 backdrop-blur-sm p-1 rounded-2xl shadow-xl border border-[#46E1D3]/10">
        <UserCard
          name={user?.name || 'John Doe'}
          email={user?.email || 'email@example.com'}
          profilePictureUrl={user?.profilePictureUrl || undefined}
        />
      </div>

      <hr className="border-t border-gray-600/30 " />

      {/* FITNESS PROFILES */}
      <div className="bg-[#46E1D3]/60  p-1 rounded-2xl shadow-xl border border-[#46E1D3]/10">
        <FitnessProfilesList
          profiles={profiles || undefined}
          isLoading={isLoading}
          onAddClick={() => setIsCreateModalOpen(true)}
          onEditClick={handleEdit}
        />
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
    </section>
  );
}
