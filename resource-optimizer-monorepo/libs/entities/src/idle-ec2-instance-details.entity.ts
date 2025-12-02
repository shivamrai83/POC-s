import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('IdleInstanceDetails')
export class IdleInstanceDetails {
  @PrimaryGeneratedColumn({ name: 'Id' })
  Id: number;

  @Column({ name: 'InstanceId', nullable: true })
  InstanceId: string;

  @Column({ name: 'InstanceName', nullable: true })
  InstanceName: string;

  @Column({ name: 'InstanceType', nullable: true })
  InstanceType: string;

  @Column({ name: 'Region', nullable: true })
  Region: string;

  @Column({ name: 'CPUUtil', type: 'float', nullable: true })
  CPUUtil: number;

  @Column({ name: 'Unit', nullable: true })
  Unit: string;

  @Column({ name: 'CurrencyCode', nullable: true })
  CurrencyCode: string;

  @Column({ name: 'PredictedMonthlyCost', type: 'float', nullable: true })
  PredictedMonthlyCost: number;

  @Column({ name: 'IsDisabled', type: 'int', default: 0 })
  IsDisabled: number;

  @Column({ name: 'AccountId', nullable: true })
  AccountId: string;

  @Column({ name: 'IsActive', type: 'int', default: 1 })
  IsActive: number;

  @Column({ name: 'CreatedBy', type: 'int', nullable: true })
  CreatedBy: number;

  @Column({ name: 'UpdatedBy', type: 'int', nullable: true })
  UpdatedBy: number;

  @Column({ name: 'IpAddress', nullable: true })
  IpAddress: string;

  @Column({ name: 'IdleReason', default: 'LOW_CPU' })
  IdleReason: string;

  @Column({ name: 'StoppedDays', type: 'int', default: 0 })
  StoppedDays: number;

  @Column({ name: 'InstanceStatus', nullable: true })
  InstanceStatus: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}


