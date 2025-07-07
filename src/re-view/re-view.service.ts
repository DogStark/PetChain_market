import { Injectable } from '@nestjs/common';
import { Review } from './entities/re-view.entity';

@Injectable()
export class ReviewsService {
  private reviews: Review[] = [];

  create(reviewDto: any): Review {
    const review = {
      ...reviewDto,
      id: this.reviews.length + 1,
      approved: false,
      helpfulCount: 0,
      response: null,
      createdAt: new Date(),
    };
    this.reviews.push(review);
    return review;
  }

  findAll(productId: string): Review[] {
    return this.reviews.filter(r => r.productId === productId && r.approved);
  }

  getAverageRating(productId: string): number {
    const approved = this.findAll(productId);
    const total = approved.reduce((sum, r) => sum + r.rating, 0);
    return approved.length ? total / approved.length : 0;
  }

  moderate(id: number, approved: boolean): string {
    const review = this.reviews.find(r => r.id === id);
    if (review) {
      review.approved = approved;
      return `Review ${id} ${approved ? 'approved' : 'rejected'}`;
    }
    return `Review ${id} not found`;
  }

  voteHelpful(id: number): string {
    const review = this.reviews.find(r => r.id === id);
    if (review) {
      review.helpfulCount += 1;
      return `Helpful vote added to review ${id}`;
    }
    return `Review ${id} not found`;
  }

  respond(id: number, response: string): string {
    const review = this.reviews.find(r => r.id === id);
    if (review) {
      review.response = response;
      return `Response added to review ${id}`;
    }
    return `Review ${id} not found`;
  }
}
