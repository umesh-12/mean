import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';

import { AdminloginService } from './adminlogin.service';
import { AuthService } from '../../../../../../shared-services/authService/auth.service';
import { EncryptionService } from '../../../../../../shared-services/encryptionservice/encryption.service';
import { Subscription } from 'rxjs';

declare var $: any;
import 'select2';

@Component({
  selector: 'app-adminlogin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, FormsModule],
  templateUrl: './adminlogin.component.html',
})
export class AdminloginComponent implements OnInit, AfterViewInit, OnDestroy {
  private notifSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private encrypt: EncryptionService,
    public service: AdminloginService,
    private el: ElementRef,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  // =========================================================
  // POPUP STATES
  // =========================================================

  showPopup: boolean = false;
  showChangePswPopup: boolean = false;
  showRegisterPopup: boolean = false;

  // =========================================================
  // LOADING STATES
  // =========================================================

  isLoading: boolean = false;
  isLoginLoading: boolean = false;
  isRegisterLoading: boolean = false;

  // =========================================================
  // NOTIFICATION STATE
  // =========================================================

  notifications: any[] = [];
  unreadNotificationCount: number = 0;

  // =========================================================
  // LOGIN FORM
  // =========================================================

  loginForm: FormGroup = new FormGroup({});

  ngOnInit() {
    this.loginForm = this.fb.group({
      userId: [0],
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: [' '],
    });
  }

  // =========================================================
  // LOGIN
  // =========================================================

  loginsubmit() {
    this.isLoginLoading = true;

    const userName = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    // ---------------------------------------------------------
    // Validate username
    // ---------------------------------------------------------

    if (!userName) {
      this.toastr.error('Username Required');
      this.isLoginLoading = false;
      return;
    }

    // ---------------------------------------------------------
    // Validate password
    // ---------------------------------------------------------

    if (!password) {
      this.toastr.error('Password Required');
      this.isLoginLoading = false;
      return;
    }

    // ---------------------------------------------------------
    // Login payload
    // ---------------------------------------------------------

    const payload = {
      userId: 0,
      username: userName,
      password: password,
      role: 'Admin',
    };

    // ---------------------------------------------------------
    // API LOGIN
    // ---------------------------------------------------------

    this.service.loginUser(payload).subscribe({
      next: async (response: any) => {
        // -----------------------------------------------------
        // Make sure only Admin can login
        // -----------------------------------------------------
        debugger;
        if (response.role !== 'Admin') {
          this.toastr.error('Only Admin can login.');
          this.isLoginLoading = false;
          return;
        }

        // -----------------------------------------------------
        // Successful login
        // -----------------------------------------------------

        if (response?.token) {
          this.isLoginLoading = false;

          // SAVE ADMIN AUTHENTICATION
          this.authService.setAdminToken(response.token);
          this.authService.setUserId(response.userId);

          // ONESIGNAL ADMIN LOGIN
          // await this.oneSignalService.loginAdmin(response.userId);

          // SUCCESS MESSAGE
          this.toastr.success('Login successful');

          // NAVIGATE TO ADMIN APPLICATION
          this.router.navigate(['/company-detail/company']);
          debugger;

          // RESET LOGIN FORM
          this.loginForm.reset();
        } else {
          this.toastr.error('Invalid login');
        }
      },

      error: (err: any) => {
        console.error('Admin login error:', err);

        if (err.status === 401 || err.status === 400) {
          this.toastr.error('Invalid username or password');
        } else {
          this.toastr.error('Server error');
        }

        this.isLoginLoading = false;
      },

      complete: () => {
        this.isLoginLoading = false;
      },
    });
  }

  // =========================================================
  // PASSWORD TOGGLE
  // =========================================================

  isPasswordVisible = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  // =========================================================
  // AFTER VIEW INIT
  // =========================================================

  ngAfterViewInit(): void {
    $('#companyCode').on('change keyup', (event: any) => {
      const upperVal = event.target.value.toUpperCase();
      $(event.target).val(upperVal);
    });
  }

  // =========================================================
  // BUTTON CLICK ANIMATION
  // =========================================================

  clicked = false;

  onClickBtn() {
    this.clicked = true;
    setTimeout(() => (this.clicked = false), 300);
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async logout() {
    try {
    } catch (error) {
      console.error('OneSignal logout error:', error);
    }

    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // =========================================================
  // ENTER KEY HANDLER
  // =========================================================

  event(e: any, recinput: any, nextinput: any) {
    if (e.key === 'Enter') {
      if (
        (recinput.id === 'companyCode' && recinput.value === '') ||
        recinput.value === undefined
      ) {
        recinput.focus();
        this.toastr.error('Code Required!');
      }

      if (
        (recinput.id === 'userName' && recinput.value === '') ||
        recinput.value === undefined
      ) {
        recinput.focus();
        this.toastr.error('Username Required');
      } else if (
        (recinput.id === 'password' && recinput.value === '') ||
        recinput.value === undefined
      ) {
        recinput.focus();
        this.toastr.error('Password Required!');
      } else {
        nextinput.focus();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.notifSubscription) {
      this.notifSubscription.unsubscribe();
    }
  }
}
