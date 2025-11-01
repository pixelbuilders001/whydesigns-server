import { IOTP } from '../models/otp.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { createBaseFields } from '../models/base.model';

export class OTPRepository extends BaseRepository<IOTP> {
  constructor() {
    super(TABLES.OTP);
  }

  /**
   * Create a new OTP record
   */
  async create(otpData: Partial<IOTP>): Promise<IOTP> {
    const id = this.generateId();

    const otp: IOTP = {
      id,
      userId: otpData.userId || '',
      email: otpData.email || '',
      otp: otpData.otp || '',
      type: otpData.type || 'email_verification',
      expiresAt: otpData.expiresAt || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      isUsed: false,
      ...createBaseFields(),
    };

    return await this.putItem(otp);
  }

  /**
   * Find OTP by userId, otp, and type
   */
  async findOne(criteria: {
    userId: string;
    otp: string;
    type: 'email_verification' | 'password_reset' | 'phone_verification';
    isUsed: boolean;
  }): Promise<IOTP | null> {
    // Scan to find the OTP (not ideal but necessary for now)
    const result = await this.scanItems({
      filterExpression: '#userId = :userId AND #otp = :otp AND #type = :type AND #isUsed = :isUsed',
      expressionAttributeNames: {
        '#userId': 'userId',
        '#otp': 'otp',
        '#type': 'type',
        '#isUsed': 'isUsed',
      },
      expressionAttributeValues: {
        ':userId': criteria.userId,
        ':otp': criteria.otp,
        ':type': criteria.type,
        ':isUsed': criteria.isUsed,
      },
    });

    return result.items.length > 0 ? result.items[0] : null;
  }

  /**
   * Delete many OTPs by criteria
   */
  async deleteMany(criteria: {
    userId: string;
    type: 'email_verification' | 'password_reset' | 'phone_verification';
    isUsed: boolean;
  }): Promise<{ deletedCount: number }> {
    // Find all matching OTPs
    const result = await this.scanItems({
      filterExpression: '#userId = :userId AND #type = :type AND #isUsed = :isUsed',
      expressionAttributeNames: {
        '#userId': 'userId',
        '#type': 'type',
        '#isUsed': 'isUsed',
      },
      expressionAttributeValues: {
        ':userId': criteria.userId,
        ':type': criteria.type,
        ':isUsed': criteria.isUsed,
      },
    });

    // Delete each OTP
    let deletedCount = 0;
    for (const otp of result.items) {
      await this.hardDeleteItem({ id: otp.id });
      deletedCount++;
    }

    return { deletedCount };
  }

  /**
   * Delete one OTP by id
   */
  async deleteOne(criteria: { id: string }): Promise<void> {
    await this.hardDeleteItem({ id: criteria.id });
  }

  /**
   * Update OTP to mark as used
   */
  async markAsUsed(id: string): Promise<IOTP | null> {
    return await this.updateItem({ id }, { isUsed: true });
  }

  /**
   * Delete user OTPs
   */
  async deleteUserOTPs(userId: string): Promise<void> {
    const result = await this.scanItems({
      filterExpression: '#userId = :userId',
      expressionAttributeNames: { '#userId': 'userId' },
      expressionAttributeValues: { ':userId': userId },
    });

    for (const otp of result.items) {
      await this.hardDeleteItem({ id: otp.id });
    }
  }
}

export default new OTPRepository();
