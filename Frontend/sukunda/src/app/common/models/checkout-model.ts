export class CheckoutPayloadModel {
  customerId: number = 0;
  voucherTypeId: number = 0;
  createdBy: number = 0;
  remarks: string = '';
  delivery: {
    address: string;
    phone: string,
    city: string;
    state: string;
    postalCode: string;
    landmark: string;
    deliveryNotes: string;
  } = {
    address: '',
    city: '',
    phone: '',
    state: '',
    postalCode: '',
    landmark: '',
    deliveryNotes: '',
  };
  details: {
    productId: number;
    productVariantId: number;
    productBatchId: number;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
  }[] = [];
}
