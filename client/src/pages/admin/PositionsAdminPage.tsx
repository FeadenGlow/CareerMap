import { useEffect, useState } from 'react';
import { positionApi } from '@entities/position/api/positionApi';
import type { Position, CreatePositionDto } from '@entities/position/types';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Modal } from '@shared/ui/Modal';
import { useAuth } from '@app/providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const positionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  level: z.number().min(1, 'Level must be at least 1'),
  department: z.string().min(1, 'Department is required'),
});

type PositionFormData = z.infer<typeof positionSchema>;

export const PositionsAdminPage = () => {
  const { logout } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
  });

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const data = await positionApi.getAll();
      setPositions(data);
    } catch (error) {
      console.error('Failed to load positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PositionFormData) => {
    try {
      if (editingPosition) {
        await positionApi.update(editingPosition.id, data);
      } else {
        await positionApi.create(data);
      }
      await loadPositions();
      setIsModalOpen(false);
      setEditingPosition(null);
      reset();
    } catch (error) {
      console.error('Failed to save position:', error);
    }
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    reset({
      title: position.title,
      level: position.level,
      department: position.department,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this position?')) {
      try {
        await positionApi.delete(id);
        await loadPositions();
      } catch (error) {
        console.error('Failed to delete position:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Manage Positions</h1>
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={() => (window.location.href = '/career-paths')}>
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
        <div className="mb-4">
          <Button onClick={() => setIsModalOpen(true)}>Create Position</Button>
        </div>

        <div className="grid gap-4">
          {positions.map((position) => (
            <Card key={position.id}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{position.title}</h3>
                  <p className="text-sm text-gray-600">
                    {position.department} - Level {position.level}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleEdit(position)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(position.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => (setIsModalOpen(false), setEditingPosition(null), reset())} title={editingPosition ? 'Edit Position' : 'Create Position'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <Input label="Level" type="number" error={errors.level?.message} {...register('level', { valueAsNumber: true })} />
          <Input label="Department" error={errors.department?.message} {...register('department')} />
          <div className="flex gap-2">
            <Button type="submit">{editingPosition ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="secondary" onClick={() => (setIsModalOpen(false), setEditingPosition(null), reset())}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

