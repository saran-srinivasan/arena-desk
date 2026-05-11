import { batchRepository } from '../repositories/BatchRepository.ts';
import type { CoachingBatch, CreateBatchDto, UpdateBatchDto } from '../types/index.ts';
import { NotFoundError, ValidationError } from '../types/index.ts';

export class BatchService {
  async getAll(): Promise<CoachingBatch[]> {
    return batchRepository.findAll();
  }

  async getById(id: string): Promise<CoachingBatch> {
    const batch = await batchRepository.findById(id);
    if (!batch) throw new NotFoundError('CoachingBatch', id);
    return batch;
  }

  async getBySport(sport: string): Promise<CoachingBatch[]> {
    return batchRepository.findBySport(sport);
  }

  async getByCoach(coachId: string): Promise<CoachingBatch[]> {
    return batchRepository.findByCoach(coachId);
  }

  async create(dto: CreateBatchDto): Promise<CoachingBatch> {
    if (!dto.name?.trim()) throw new ValidationError('Batch name is required');
    if (!dto.sport) throw new ValidationError('Sport is required');
    if (!dto.coachId) throw new ValidationError('Coach is required');
    if (!dto.resourceId) throw new ValidationError('Resource is required');
    if (!dto.scheduleDays?.length) throw new ValidationError('Schedule days are required');
    if (!dto.startTime || !dto.endTime) throw new ValidationError('Start and end time are required');
    if (!dto.startDate || !dto.endDate) throw new ValidationError('Start and end date are required');
    if (!dto.fee || dto.fee <= 0) throw new ValidationError('Fee must be positive');

    const id = `batch-${Date.now()}`;
    return batchRepository.create(id, dto);
  }

  async update(id: string, dto: UpdateBatchDto): Promise<CoachingBatch> {
    const existing = await batchRepository.findById(id);
    if (!existing) throw new NotFoundError('CoachingBatch', id);
    return batchRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await batchRepository.findById(id);
    if (!existing) throw new NotFoundError('CoachingBatch', id);
    await batchRepository.delete(id);
  }
}

export const batchService = new BatchService();
