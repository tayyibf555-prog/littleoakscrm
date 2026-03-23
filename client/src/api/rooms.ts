import api from './client';
import type { Room } from '@/types/room';

export interface CreateRoomData {
  name: string;
  ageRangeMin: number;
  ageRangeMax: number;
  capacity: number;
  ratioRequired: string;
}

export interface UpdateRoomData extends Partial<CreateRoomData> {}

export const roomsApi = {
  list: () =>
    api.get<Room[]>('/rooms'),

  get: (id: string) =>
    api.get<Room>(`/rooms/${id}`),

  create: (data: CreateRoomData) =>
    api.post<Room>('/rooms', data),

  update: (id: string, data: UpdateRoomData) =>
    api.patch<Room>(`/rooms/${id}`, data),
};
