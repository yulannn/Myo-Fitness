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
import { Plus } from "lucide-react"

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

  const handleDelete = (id: number) => {
    setProfileToDelete(id);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      deleteMutation.mutate(profileToDelete, {
        onSuccess: () => setProfileToDelete(null),
      });
    }
  };

  return (
    <section className="space-y-6">
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

      <UserCard
        name={user?.name || 'John Doe'}
        email={user?.email || 'email@example.com'}
        profilePictureUrl={user?.profilePictureUrl || undefined}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Mon profil fitness</h2>
        {!profiles && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={16} />
            Ajouter un profil
          </button>
        )
        }
      </div>

      <FitnessProfilesList
        profiles={profiles || undefined}
        isLoading={isLoading}
        onAddClick={() => setIsCreateModalOpen(true)}
        onDeleteClick={handleDelete}
      />

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