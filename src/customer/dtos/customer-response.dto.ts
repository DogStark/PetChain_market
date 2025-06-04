export class CustomerResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  billingAddress: Record<string, any> | null;
  shippingAddress: Record<string, any> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}