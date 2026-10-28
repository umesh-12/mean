export class Endpoint {
  static getProductById = '/api/Product/getbyid?productId=';
  static cart = '/api/Cart/add';

  static getecommerceproducts = '/api/Product/getecommerceproducts';
  static getecommerceproductdetails = '/api/Product/getecommerceproductdetails?productId=';


  static category = '/api/Category/getall'; // https://localhost:7140/
  static cartList = '/api/Cart/get?customerId=';

  static updatequantity = '/api/Cart/updatequantity';

  static deleteCart = '/api/Cart/removeitem';
  static clearCart = '/api/Cart/clear?customerId=';

  static getAllBrand = '/api/Brand/getall';

  static getAllMetalType = '/api/PetType/getall';

  static getAllProductType = '/api/ProductType/getall';


  static order = '/api/Order/create-cod';
}
