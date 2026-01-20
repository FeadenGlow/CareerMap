export interface Position {
  id: string;
  title: string;
  level: number;
  department: string;
}

export interface CreatePositionDto {
  title: string;
  level: number;
  department: string;
}

export interface UpdatePositionDto {
  title?: string;
  level?: number;
  department?: string;
}

