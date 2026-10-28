export class Endpoint {
  static saveProductReview = '/api/ProductReview/create';
  static getbyid = '/api/ProductReview/getbyproduct?productId=';
  static summary = '/api/ProductReview/summary?productId=';

  static getall = '/api/ProductReview/getall';
  static updateStatus = '/api/PetType/changestatus?id=';

  //extra
  static products = '/api/Product/getall';
}
