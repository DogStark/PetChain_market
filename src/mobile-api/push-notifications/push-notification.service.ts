import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './device-token.entity';
import * as admin from 'firebase-admin';

@Injectable()
export class PushNotificationService {
  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
  ) {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  async registerDeviceToken(userId: string, token: string, platform: string): Promise<void> {
    await this.deviceTokenRepository.save({
      userId,
      token,
      platform,
      isActive: true,
    });
  }

  async unregisterDeviceToken(token: string): Promise<void> {
    await this.deviceTokenRepository.update(
      { token },
      { isActive: false },
    );
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const deviceTokens = await this.deviceTokenRepository.find({
      where: { userId, isActive: true },
    });

    const message: admin.messaging.MulticastMessage = {
      tokens: deviceTokens.map(dt => dt.token),
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(deviceTokens[idx].token);
          }
        });

        // Remove failed tokens
        if (failedTokens.length > 0) {
          await this.deviceTokenRepository.update(
            { token: { $in: failedTokens } },
            { isActive: false },
          );
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  async sendBulkNotifications(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const deviceTokens = await this.deviceTokenRepository.find({
      where: {
        userId: { $in: userIds },
        isActive: true,
      },
    });

    const message: admin.messaging.MulticastMessage = {
      tokens: deviceTokens.map(dt => dt.token),
      notification: {
        title,
        body,
      },
      data,
    };

    try {
      await admin.messaging().sendMulticast(message);
    } catch (error) {
      console.error('Error sending bulk push notifications:', error);
      throw error;
    }
  }
} 