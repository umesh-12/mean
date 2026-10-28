import { Injectable } from "@angular/core"

@Injectable({
  providedIn: 'root'
})

export class Endpoint {

  adminLogin = '/api/auth/login';
  forgotPassword = '/api/Auth/forgotpassword';
  changePassword = '/api/Auth/reset-password';

  register = '/api/Auth/register';

  getuserbyId = '/api/Auth/getuserbyId?userId='

    testAPI = '/api/Test';

}

