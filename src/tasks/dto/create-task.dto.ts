import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Fix login bug' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The login button does not respond on mobile' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: ['pending', 'in_progress', 'completed'], default: 'pending' })
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed'])
  status?: string;
}
