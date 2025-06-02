export class CreateOrderDto {
  userId!: string;
  items!: Array<{ productId: string; quantity: number; price: number }>;
  total!: number;
}
