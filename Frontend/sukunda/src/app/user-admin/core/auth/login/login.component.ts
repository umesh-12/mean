import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { loginService } from './login.service';
import { EncryptionService } from '../../../../shared-services/encryptionservice/encryption.service';
import { AuthService } from '../../../../shared-services/authService/auth.service';
declare var $: any;

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent implements AfterViewInit {
  selectedUserId!: number;

  showPopup: boolean = false;
  showChangePswPopup: boolean = false;

  showRegisterPopup: boolean = false;

  isLoginLoading: boolean = false;
  isLoading: boolean = false;

  openPopup() {
    this.showPopup = true;
  }


  constructor(
    private toastr: ToastrService,
    private router: Router,
    private encrypt: EncryptionService,
    public service: loginService,
    private el: ElementRef,
    private authService: AuthService
  ) {}

  // Password Toggle
  isPasswordVisible = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  ngAfterViewInit(): void {}

  // ---------------- LOGIN ----------------
  loginSubmit() {
    this.isLoginLoading = true;
    const userName = this.service.loginModel.username;
    const password = this.service.loginModel.password;

    if (!userName) {
      this.toastr.error('Username Required');
      this.isLoginLoading = false;
      return;
    }

    if (!password) {
      this.toastr.error('Password Required');
      this.isLoginLoading = false;

      return;
    }

    // JSON Body
    const payload = {
      userId: 0,
      username: this.service.loginModel.username,
      password: this.service.loginModel.password,
      role: this.service.loginModel.role,
    };

    this.service.loginUser(payload).subscribe({
      next: async (response: any) => {
        debugger
        // Customer बाहेक अरूलाई login नदिने
        if (response.role !== 'user') {
          this.toastr.error('Only Customer can login.');
          this.isLoginLoading = false;
          return;
        }

        this.authService.setCustomerToken(response?.token);
        this.authService.setCustomerId(response.userId);



        this.toastr.success('Login successful');
        this.router.navigate(['/home']);
      },

      error: (err: any) => {
        if (err.status === 401 || err.status === 400) {
          this.toastr.error('Invalid username or password');
        } else {
          this.toastr.error('Server error');
        }
        this.isLoginLoading = false;
      },
      complete: () => {
        this.isLoginLoading = false; // ✅ unlock button after response
      },
    });
  }


}
