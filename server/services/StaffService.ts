import { staffRepository } from '../repositories/StaffRepository.ts';
import type { Staff, CreateStaffDto, UpdateStaffDto } from '../types/index.ts';
import { NotFoundError, ValidationError, ConflictError } from '../types/index.ts';

export class StaffService {
  async getAll(): Promise<Staff[]> {
    return staffRepository.findAll();
  }

  async getById(id: string): Promise<Staff> {
    const staff = await staffRepository.findById(id);
    if (!staff) throw new NotFoundError('Staff', id);
    return staff;
  }

  async create(dto: CreateStaffDto): Promise<Staff> {
    if (!dto.name) throw new ValidationError('Name is required');
    if (!dto.role) throw new ValidationError('Role is required');
    if (!dto.email) throw new ValidationError('Email is required');

    const id = `staff-${Date.now()}`;
    return staffRepository.create(id, dto);
  }

  async update(id: string, dto: UpdateStaffDto): Promise<Staff> {
    const existing = await staffRepository.findById(id);
    if (!existing) throw new NotFoundError('Staff', id);
    return staffRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await staffRepository.findById(id);
    if (!existing) throw new NotFoundError('Staff', id);
    return staffRepository.delete(id);
  }
}

export const staffService = new StaffService();
