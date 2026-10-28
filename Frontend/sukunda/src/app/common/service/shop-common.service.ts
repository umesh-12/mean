import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Endpoint } from './../end-point/shop-Urls';
import { environment } from '../../../environments/environment';

import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CartEventService } from './cart-event.service';
import { CheckoutPayloadModel } from '../models/checkout-model'; // ✅ Correct

@Injectable({
  providedIn: 'root',
})
export class ShopCommonService {
  private apiBaseUrlForProduct = environment.apiBaseUrlForProduct;
  private baseurl = environment.apiBaseUrl;

  CheckoutPayloadModel: CheckoutPayloadModel = new CheckoutPayloadModel();

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private cartEventService: CartEventService,
  ) {}

  //product
  getecommerceproductdetails(id: number) {
    return this.http.get(
      `${this.apiBaseUrlForProduct}${Endpoint.getecommerceproductdetails}${id}`,
    );
  }

  getecommerceproducts() {
    return this.http.get(
      `${this.apiBaseUrlForProduct}${Endpoint.getecommerceproducts}`,
    );
  }

  getCategoryList() {
    return this.http.get(`${this.baseurl}${Endpoint.category}`);
  }

  //cart
  postCart(data: any) {
    return this.http.post(`${this.apiBaseUrlForProduct}${Endpoint.cart}`, data);
  }

  getCartList(customerId: any) {
    return this.http.get(
      `${this.apiBaseUrlForProduct}${Endpoint.cartList}${customerId}`,
    );
  }

  updateCart(data: any) {
    return this.http.put(`${this.apiBaseUrlForProduct}${Endpoint.updatequantity}`, data);
  }

  deleteCart(data: any) {
    return this.http.delete(
      `${this.apiBaseUrlForProduct}${Endpoint.deleteCart}`,
      { body: data },
    );
  }

  clearCart(customerId: any) {
    return this.http.delete(
      `${this.apiBaseUrlForProduct}${Endpoint.clearCart}${customerId}`,
    );
  }

  // brand
  getAllBrands() {
    return this.http.get(`${this.baseurl}${Endpoint.getAllBrand}`);
  }

  // metal type
  getMetalTypeList() {
    return this.http.get(`${this.baseurl}${Endpoint.getAllMetalType}`);
  }

  // product type
  getProductTypeList() {
    return this.http.get(`${this.baseurl}${Endpoint.getAllProductType}`);
  }

  //order

  order(data: any) {
    return this.http.post(
      `${this.apiBaseUrlForProduct}${Endpoint.order}`,
      data,
    );
  }

  //  यो एउटा फङ्सनले दुवै कम्पोनेन्टको ६० लाइन कोड बचाउँछ
  // addToCart(productId: number, quantity: number): Observable<any> {
  //   const payload = { productId, quantity };

  //   return this.http.post(`${this.apiBaseUrlForProduct}/api/cart`, payload).pipe(
  //     tap({
  //       next: (res: any) => {
  //         // १. साइडबारलाई लिस्ट रिफ्रेश गर्न अलार्म दिने
  //         this.cartEventService.notifyCartUpdate();
  //         // २. टोस्टर नोटिफिकेसन देखाउने
  //         this.toastr.success('Successfully item added to cart');
  //       },
  //       error: (err) => {
  //         // ब्याकइन्डबाट एरर आए टोस्टर देखाउन मन लागे यहाँ थप्न सक्नुहुन्छ
  //         this.toastr.error(err.error?.message || 'Something went wrong');
  //       }
  //     })
  //   );
  // }
}
