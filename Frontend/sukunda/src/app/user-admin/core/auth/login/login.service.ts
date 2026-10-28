import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Endpoint } from './login-Urls';
import { changePswModel, loginModel } from './login.model';

@Injectable({
  providedIn: 'root',
})
export class loginService {
  baseurl = environment.API_URL;

  loginModel: loginModel = new loginModel();
  changePswModel: changePswModel = new changePswModel();

  constructor(
    private http: HttpClient,
    private router: Router,
    private endPoint: Endpoint,
  ) {}

  loginUser(data: any) {
    return this.http
      .post<any>(`${environment.API_URL}/api/auth/login`, {
        email: data.username ?? data.email,
        password: data.password,
      })
      .pipe(
        // Express ko response lai purano shape ma badalne
        map((res) => ({
          token: res.token,
          customerId: res.user.id,
          role: res.user.role,
          fullName: res.user.name,
        })),
      );
  }
}
