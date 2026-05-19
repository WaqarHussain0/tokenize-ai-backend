import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Base class shared by all entities.
 *
 * Provides a UUID primary key, automatic create/update timestamps,
 * and soft-delete support via `deletedAt` and `isDelete` fields.
 */
export default abstract class CustomBaseEntity extends BaseEntity {
  /** Unique identifier for the entity (UUID v4). */
  @ApiProperty({
    description: 'Unique identifier for the entity',
    format: 'uuid',
    example: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  /** Date and time when the entity was created (ISO 8601). */
  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
    example: '2023-01-01T00:00:00.000Z',
    readOnly: true,
  })
  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  /** Date and time when the entity was last updated (ISO 8601). */
  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
    example: '2023-01-02T00:00:00.000Z',
    readOnly: true,
  })
  @AutoMap()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  /** Date and time when the entity was soft-deleted; null if not deleted. */
  @ApiPropertyOptional({
    description: 'Soft-delete timestamp; null if not deleted',
    type: String,
    format: 'date-time',
    nullable: true,
    readOnly: true,
  })
  @AutoMap()
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  /** Soft-delete flag; true if the entity has been soft-deleted. */
  @ApiProperty({
    description: 'Soft-delete flag',
    default: false,
    readOnly: true,
  })
  @AutoMap()
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'uuid', nullable: true })
  @AutoMap()
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  @AutoMap()
  updatedById: string;
}
