export interface Skill {
  id: string;
  name: string;
  category?: string | null;
}

export interface CreateSkillDto {
  name: string;
  category?: string;
}

export interface UpdateSkillDto {
  name?: string;
  category?: string;
}

