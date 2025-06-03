export class CartItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export class CartResponseDto {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItemResponseDto[];
  totalAmount: number;
  totalItems: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
