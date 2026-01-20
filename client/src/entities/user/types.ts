import type { Skill } from '@entities/skill/types';

export interface User {
  id: string;
  email: string;
  role: 'EMPLOYEE' | 'HR' | 'ADMIN';
  positionId?: string | null;
  position?: {
    id: string;
    title: string;
    level: number;
    department: string;
  };
  skills?: Skill[];
}

