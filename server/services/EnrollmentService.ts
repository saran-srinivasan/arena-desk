import { enrollmentRepository } from '../repositories/EnrollmentRepository.ts';
import { batchRepository } from '../repositories/BatchRepository.ts';
import { customerRepository } from '../repositories/CustomerRepository.ts';
import type { StudentEnrollment, CreateEnrollmentDto } from '../types/index.ts';
import { NotFoundError, ValidationError } from '../types/index.ts';

export class EnrollmentService {
  async getByBatch(batchId: string): Promise<StudentEnrollment[]> {
    return enrollmentRepository.findByBatch(batchId);
  }

  async getByStudent(studentId: string): Promise<StudentEnrollment[]> {
    return enrollmentRepository.findByStudent(studentId);
  }

  async enroll(dto: CreateEnrollmentDto): Promise<StudentEnrollment> {
    // Validate student
    const student = await customerRepository.findById(dto.studentId);
    if (!student) throw new NotFoundError('Student', dto.studentId);

    // Validate batch
    const batch = await batchRepository.findById(dto.batchId);
    if (!batch) throw new NotFoundError('CoachingBatch', dto.batchId);
    if (batch.status === 'Cancelled') throw new ValidationError('Cannot enroll in a cancelled batch');

    // Check duplicate
    const existing = await enrollmentRepository.findByStudentAndBatch(dto.studentId, dto.batchId);
    if (existing && existing.status === 'Active') throw new ValidationError('Student is already enrolled in this batch');

    // Check capacity
    const currentCount = await enrollmentRepository.countActiveByBatch(dto.batchId);
    if (currentCount >= batch.maxStudents) throw new ValidationError('Batch is at full capacity');

    // Update customer type to Student if Walk-in
    if (student.customerType === 'Walk-in') {
      await customerRepository.update(student.id, { customerType: 'Student' });
    }

    const id = `enr-${Date.now()}`;
    return enrollmentRepository.create(id, dto);
  }

  async updatePaymentStatus(id: string, status: string): Promise<StudentEnrollment> {
    const existing = await enrollmentRepository.findById(id);
    if (!existing) throw new NotFoundError('StudentEnrollment', id);
    return enrollmentRepository.updatePaymentStatus(id, status);
  }

  async drop(id: string): Promise<StudentEnrollment> {
    const existing = await enrollmentRepository.findById(id);
    if (!existing) throw new NotFoundError('StudentEnrollment', id);
    if (existing.status === 'Dropped') throw new ValidationError('Student is already dropped');
    return enrollmentRepository.drop(id);
  }
}

export const enrollmentService = new EnrollmentService();
