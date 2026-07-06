import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  async findAll(userId: number): Promise<Task[]> {
    return await Task.find({ where: { userId } });
  }

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const task = Task.create({ ...createTaskDto, status: createTaskDto.status ?? 'pending', userId });
    return await task.save();
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task =  await Task.findOne({ where: { id, userId } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await Task.findOne({ where: { id, userId } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.title = updateTaskDto.title ?? task.title;
    task.description = updateTaskDto.description ?? task.description;
    task.status = updateTaskDto.status ?? task.status;
    task.priority = updateTaskDto.priority ?? task.priority;

    return await task.save();
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await Task.findOne({ where: { id, userId } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await task.remove();
  }
}
