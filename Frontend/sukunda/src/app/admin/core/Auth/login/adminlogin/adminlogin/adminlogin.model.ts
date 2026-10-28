export class adminlogin {
  userId: string = '';
  username: string = '';
  password: string = '';
  role: string = '';
}

export class changePswModel {
  otp: string = '';
  email: string = '';
  newPassword: string = '';
}

export class registerModel {
  // username: string = ''
  // password: string = ''
  // email: string = ''
  // fullName: string = ''
  // phone: any
  // role: string = 'Admin'

  userID: number = 0;
  username: string = '';
  password: string = '';
  email: string = '';
  fullName: string = '';
  phone: string = '';
  roleID: number = 1; // Default role ID for Admin
  hireDate: string = '';
  isActive: boolean = true;
  companyID: number = 0;
  branchID: number = 0;

}
