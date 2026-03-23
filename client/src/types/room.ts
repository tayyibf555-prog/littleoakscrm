export interface Room {
  id: string;
  name: string;
  ageRangeMin: number;
  ageRangeMax: number;
  capacity: number;
  ratioRequired: string;
  currentCount?: number;
  createdAt: string;
  updatedAt: string;
}
