import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEvent } from '../entities/subscription-event.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SubscriptionEventsService {
  constructor(
    @InjectRepository(SubscriptionEvent)
    private eventRepository: Repository<SubscriptionEvent>,
    private httpService: HttpService,
  ) {}

  async emitEvent(subscriptionId: string, eventType: string, payload: any) {
    // Save event to database
    const event = await this.eventRepository.save({
      subscription: { id: subscriptionId },
      eventType,
      payload,
    });

    return event;
  }

  async getEvents(subscriptionId: string): Promise<SubscriptionEvent[]> {
    return this.eventRepository.find({
      where: { subscription: { id: subscriptionId } },
      order: { createdAt: 'DESC' },
    });
  }

  private async notifyWebhooks(
    subscriptionId: string,
    eventType: string,
    payload: any,
  ) {
    const webhooks = [];
    // await this.webhookRepository.find({ where: { eventType } });

    await Promise.all(
      webhooks.map(webhook =>
        firstValueFrom(
          this.httpService.post(webhook.url, {
            event: eventType,
            subscriptionId,
            data: payload,
            timestamp: new Date().toISOString(),
          }),
        ).catch(error => {
          console.error(
            `Failed to notify webhook ${webhook.url}: ${error.message}`,
          );
        }),
      ),
    );
  }
}
