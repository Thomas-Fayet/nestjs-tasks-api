import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('findAll', () => {
    it('returns only tasks belonging to the user', async () => {
      const tasks = [{ id: 1, userId: 1, title: 'Test' }] as Task[];
      jest.spyOn(Task, 'find').mockResolvedValue(tasks);

      const result = await service.findAll(1);

      expect(Task.find).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual(tasks);
    });
  });

  describe('create', () => {
    it('creates a task with pending status by default', async () => {
      const mockTask = { save: jest.fn().mockResolvedValue(undefined) } as unknown as Task;
      jest.spyOn(Task, 'create').mockReturnValue(mockTask);

      await service.create({ title: 'Test', description: 'Desc' }, 1);

      expect(Task.create).toHaveBeenCalledWith({ title: 'Test', description: 'Desc', status: 'pending', userId: 1 });
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('uses provided status when given', async () => {
      const mockTask = { save: jest.fn().mockResolvedValue(undefined) } as unknown as Task;
      jest.spyOn(Task, 'create').mockReturnValue(mockTask);

      await service.create({ title: 'Test', description: 'Desc', status: 'in_progress' }, 1);

      expect(Task.create).toHaveBeenCalledWith({ title: 'Test', description: 'Desc', status: 'in_progress', userId: 1 });
    });
  });

  describe('findOne', () => {
    it('returns the task when found', async () => {
      const task = { id: 1, userId: 1 } as Task;
      jest.spyOn(Task, 'findOne').mockResolvedValue(task);

      const result = await service.findOne(1, 1);

      expect(Task.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: 1 } });
      expect(result).toEqual(task);
    });

    it('throws NotFoundException when task does not exist', async () => {
      jest.spyOn(Task, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and saves the task', async () => {
      const mockTask = {
        id: 1,
        title: 'Old title',
        description: 'Old desc',
        status: 'pending',
        save: jest.fn().mockResolvedValue(undefined),
      } as unknown as Task;
      jest.spyOn(Task, 'findOne').mockResolvedValue(mockTask);

      await service.update(1, { title: 'New title' }, 1);

      expect(mockTask.title).toBe('New title');
      expect(mockTask.description).toBe('Old desc');
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when task does not exist', async () => {
      jest.spyOn(Task, 'findOne').mockResolvedValue(null);

      await expect(service.update(1, { title: 'New' }, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes the task', async () => {
      const mockTask = { id: 1, remove: jest.fn().mockResolvedValue(undefined) } as unknown as Task;
      jest.spyOn(Task, 'findOne').mockResolvedValue(mockTask);

      await service.remove(1, 1);

      expect(mockTask.remove).toHaveBeenCalled();
    });

    it('throws NotFoundException when task does not exist', async () => {
      jest.spyOn(Task, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
