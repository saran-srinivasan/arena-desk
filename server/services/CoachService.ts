import { coachRepository } from '../repositories/CoachRepository.ts';
import { batchRepository } from '../repositories/BatchRepository.ts';
import { attendanceRepository } from '../repositories/AttendanceRepository.ts';
import type { Coach, CreateCoachDto, UpdateCoachDto, CoachPerformance } from '../types/index.ts';
import { NotFoundError, ValidationError } from '../types/index.ts';

export class CoachService {
  async getAll(): Promise<Coach[]> {
    return coachRepository.findAll();
  }

  async getActive(): Promise<Coach[]> {
    return coachRepository.findActive();
  }

  async getById(id: string): Promise<Coach> {
    const coach = await coachRepository.findById(id);
    if (!coach) throw new NotFoundError('Coach', id);
    return coach;
  }

  async create(dto: CreateCoachDto): Promise<Coach> {
    if (!dto.name?.trim()) throw new ValidationError('Coach name is required');
    if (!dto.phone?.trim()) throw new ValidationError('Phone is required');
    if (!dto.email?.trim()) throw new ValidationError('Email is required');
    if (!dto.sportSpecializations?.length) throw new ValidationError('At least one sport specialization required');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) throw new ValidationError('Invalid email format');

    const existing = await coachRepository.findByEmail(dto.email);
    if (existing) throw new ValidationError(`A coach with email '${dto.email}' already exists`);

    const id = `coach-${Date.now()}`;
    return coachRepository.create(id, dto);
  }

  async update(id: string, dto: UpdateCoachDto): Promise<Coach> {
    const existing = await coachRepository.findById(id);
    if (!existing) throw new NotFoundError('Coach', id);

    if (dto.email) {
      const byEmail = await coachRepository.findByEmail(dto.email);
      if (byEmail && byEmail.id !== id) throw new ValidationError(`A coach with email '${dto.email}' already exists`);
    }

    return coachRepository.update(id, dto);
  }

  async deactivate(id: string): Promise<Coach> {
    const existing = await coachRepository.findById(id);
    if (!existing) throw new NotFoundError('Coach', id);
    return coachRepository.deactivate(id);
  }

  async getPerformance(id: string): Promise<CoachPerformance> {
    const coach = await coachRepository.findById(id);
    if (!coach) throw new NotFoundError('Coach', id);

    const batches = await batchRepository.findByCoach(id);
    const activeBatches = batches.filter(b => b.status === 'Active');
    const totalStudents = batches.reduce((sum, b) => sum + (b.enrolledCount ?? 0), 0);

    // Calculate average attendance across all batches
    let totalRecords = 0;
    let totalPresent = 0;
    for (const batch of batches) {
      const stats = await attendanceRepository.getAttendanceStats(batch.id);
      totalRecords += stats.total;
      totalPresent += stats.present;
    }
    const averageAttendancePercent = totalRecords > 0 ? Math.round((totalPresent / totalRecords)) : 0;

    return {
      coach,
      totalBatches: batches.length,
      activeBatches: activeBatches.length,
      totalStudents,
      averageAttendancePercent,
    };
  }
}

export const coachService = new CoachService();
