import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
