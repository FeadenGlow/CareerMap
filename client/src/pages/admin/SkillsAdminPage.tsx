import { useEffect, useState } from 'react';
import { skillApi } from '@entities/skill/api/skillApi';
import type { Skill, CreateSkillDto } from '@entities/skill/types';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Modal } from '@shared/ui/Modal';
import { useAuth } from '@app/providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
});

type SkillFormData = z.infer<typeof skillSchema>;

export const SkillsAdminPage = () => {
  const { logout } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await skillApi.getAll();
      setSkills(data);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SkillFormData) => {
    try {
      if (editingSkill) {
        await skillApi.update(editingSkill.id, data);
      } else {
        await skillApi.create(data);
      }
      await loadSkills();
      setIsModalOpen(false);
      setEditingSkill(null);
      reset();
    } catch (error) {
      console.error('Failed to save skill:', error);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    reset({
      name: skill.name,
      category: skill.category || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        await skillApi.delete(id);
        await loadSkills();
      } catch (error) {
        console.error('Failed to delete skill:', error);
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
            <h1 className="text-xl font-semibold">Manage Skills</h1>
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
          <Button onClick={() => setIsModalOpen(true)}>Create Skill</Button>
        </div>

        <div className="grid gap-4">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{skill.name}</h3>
                  {skill.category && <p className="text-sm text-gray-600">{skill.category}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleEdit(skill)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(skill.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => (setIsModalOpen(false), setEditingSkill(null), reset())} title={editingSkill ? 'Edit Skill' : 'Create Skill'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Category" error={errors.category?.message} {...register('category')} />
          <div className="flex gap-2">
            <Button type="submit">{editingSkill ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="secondary" onClick={() => (setIsModalOpen(false), setEditingSkill(null), reset())}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

