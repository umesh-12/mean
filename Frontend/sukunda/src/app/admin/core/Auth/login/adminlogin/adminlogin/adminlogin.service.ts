import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { Endpoint } from './adminloginUrl';
import { changePswModel, registerModel } from './adminlogin.model';
import { environment } from '../../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminloginService {
  API_URL = environment.API_URL;

  changePswModel: changePswModel = new changePswModel();
  registerModel: registerModel = new registerModel();

  constructor(
    private http: HttpClient,
    private router: Router,
    private endPoint: Endpoint,
  ) {}

  loginUser(payload: any) {
    return this.http
      .post<any>( `${this.API_URL}${this.endPoint.adminLogin}`, {
        email: payload.username, // username box ma email lekhne
        password: payload.password,
      })
      .pipe(
        map((res) => ({
          token: res.token,
          userId: res.user.id,
          role: res.user.role === 'admin' ? 'Admin' : 'User',
        })),
      );
  }


}
