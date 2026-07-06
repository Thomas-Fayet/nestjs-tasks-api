import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskPriority } from '../task.entity';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Fix login bug' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: 'The login button does not respond on mobile' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ enum: ['pending', 'in_progress', 'completed'] })
  @IsIn(['pending', 'in_progress', 'completed'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
