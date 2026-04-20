import { resourceRepository } from '../repositories/ResourceRepository.ts';
import type { Resource } from '../types/index.ts';
import { NotFoundError } from '../types/index.ts';

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
}

export const resourceService = new ResourceService();
