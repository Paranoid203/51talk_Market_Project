import { PartialType } from '@nestjs/swagger';
import { CreateDemandDto } from './create-demand.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DemandStatus } from '@prisma/client';

export class UpdateDemandDto extends PartialType(CreateDemandDto) {
  @ApiPropertyOptional({ description: '需求状态', enum: DemandStatus })
  @IsOptional()
  @IsEnum(DemandStatus)
  status?: DemandStatus;
}

