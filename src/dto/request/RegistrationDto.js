class RegistrationDto {
  constructor(data) {
    // ✅ Registration fields
    this.reg_id = data.reg_id;
    this.v_owner_name = data.v_owner_name;
    this.v_org_name = data.v_org_name || null;
    this.v_org_id = data.v_org_id || null;
    this.v_owner_contact = data.v_owner_contact;
    this.v_owner_address = data.v_owner_address;
    this.is_org = data.is_org ?? 0;
    this.status = data.status ?? 1;

    // ✅ User fields (skip user_id since it's foreign key derived from user)
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role || 'user';
    this.isActive = data.isActive ?? true;
  }

validate() {
  const errors = [];

  const reg_id = this.reg_id?.trim();
  const v_owner_name = this.v_owner_name?.trim();
  const v_owner_contact = this.v_owner_contact?.trim();
  const v_owner_address = this.v_owner_address?.trim();
  const email = this.email?.trim();
  const password = this.password?.trim();
  const firstName = this.firstName?.trim();
  const lastName = this.lastName?.trim();

  // Required fields check
  if (!reg_id) errors.push('Registration ID is required');
  if (!v_owner_name) errors.push('Owner name is required');
  if (!v_owner_contact) errors.push('Owner contact is required');
  if (!v_owner_address) errors.push('Owner address is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!firstName) errors.push('First name is required');
  if (!lastName) errors.push('Last name is required');

  // Format validations
  if (v_owner_contact && !/^[6-9]\d{9}$/.test(v_owner_contact)) {
    errors.push('Invalid mobile number format');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

}

module.exports = RegistrationDto;