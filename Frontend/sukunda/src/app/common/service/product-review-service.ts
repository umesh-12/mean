import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProductReviewModel } from '../../common/models/product-review.models';
import { Endpoint } from '../../common/end-point/product-review-Urls';

@Injectable({
  providedIn: 'root',
})
export class ProductReviewService {
  private apiBaseUrlForProduct = environment.apiBaseUrlForProduct;

  ProductReviewModel: ProductReviewModel = new ProductReviewModel();

  constructor(private http: HttpClient) {}

  postProductReview(data: any) {
    return this.http.post(
      `${this.apiBaseUrlForProduct}${Endpoint.saveProductReview}`,
      data,
    );
  }

  getProductReviewList() {
    return this.http.get(`${this.apiBaseUrlForProduct}${Endpoint.getall}`);
  }

  getByProductId(id: number) {
    return this.http.get(
      `${this.apiBaseUrlForProduct}${Endpoint.getbyid}${id}`,
    );
  }

  changeStatus(reviewId: number, updatedBy: any) {
    const payload = {
      reviewId: reviewId,
      updatedBy: updatedBy,
    };

    return this.http.put(
      `${this.apiBaseUrlForProduct}${Endpoint.updateStatus}`,
      payload,
    );
  }



  // extra
   getProductsList() {
      return this.http.get(`${this.apiBaseUrlForProduct}${Endpoint.products}`);
    }


}
