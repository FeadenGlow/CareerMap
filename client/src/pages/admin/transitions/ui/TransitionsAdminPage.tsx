import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/config/routes';
import { useAuth } from '@app/providers/AuthProvider';
import { Button } from '@shared/ui/Button';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { useTransitionsAdminModel } from '../model/useTransitionsAdminModel';
import { TransitionListSection } from './sections/TransitionListSection';
import { TransitionFormModal } from './sections/TransitionFormModal';

export function TransitionsAdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const model = useTransitionsAdminModel();

  if (model.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Manage Transitions</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.CAREER_PATHS)}
              >
                Career Paths
              </Button>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {model.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 mb-4">
            {model.error}
          </div>
        )}
        <div className="mb-4">
          <Button onClick={model.openModal}>Create Transition</Button>
        </div>

        <TransitionListSection
          transitions={model.transitions}
          onEdit={model.handleEdit}
          onDelete={model.handleDelete}
        />
      </div>

      <TransitionFormModal
        isOpen={model.isModalOpen}
        onClose={model.closeModal}
        title={
          model.editingTransition ? 'Edit Transition' : 'Create Transition'
        }
        positions={model.positions}
        skills={model.skills}
        register={model.form.register}
        watch={model.form.watch}
        onSubmit={model.form.handleSubmit(model.onSubmit)}
        onToggleSkill={model.toggleSkill}
        onCancel={model.closeModal}
        isEdit={!!model.editingTransition}
      />
    </div>
  );
}
