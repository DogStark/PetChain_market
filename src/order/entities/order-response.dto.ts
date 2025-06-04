export class OrderResponseDto {
  id: string;
  customerId: string;
  subscriptionId: string | null;
  totalAmount: number;
  status: string;
  shippingAddress: Record<string, any> | null;
  billingAddress: Record<string, any> | null;
  items: OrderItemResponseDto[];
  createdAt: Date;
}

export class OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}