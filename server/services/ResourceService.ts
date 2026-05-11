import { resourceRepository } from '../repositories/ResourceRepository.ts';
import type { Resource, CreateResourceDto, UpdateResourceDto } from '../types/index.ts';
import { NotFoundError, ValidationError } from '../types/index.ts';

export class ResourceService {
  async getAll(): Promise<Resource[]> {
    return resourceRepository.findAll();
  }

  async getById(id: string): Promise<Resource> {
    const resource = await resourceRepository.findById(id);
    if (!resource) throw new NotFoundError('Resource', id);
    return resource;
  }

  async getBySport(sport: string): Promise<Resource[]> {
    return resourceRepository.findBySport(sport);
  }

  async create(dto: CreateResourceDto): Promise<Resource> {
    if (!dto.name) throw new ValidationError('Name is required');
    if (!dto.type) throw new ValidationError('Type is required');
    if (!dto.supportedSports || dto.supportedSports.length === 0) throw new ValidationError('At least one supported sport is required');

    const id = `res-${Date.now()}`;
    return resourceRepository.create(id, dto);
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource> {
    const existing = await resourceRepository.findById(id);
    if (!existing) throw new NotFoundError('Resource', id);
    return resourceRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await resourceRepository.findById(id);
    if (!existing) throw new NotFoundError('Resource', id);
    return resourceRepository.delete(id);
  }
}

export const resourceService = new ResourceService();
