class RegistrationResponseDto {
  constructor(registration) {
    this.reg_id = registration.reg_id;
    this.v_owner_name = registration.v_owner_name;
    this.v_org_name = registration.v_org_name;
    this.v_org_id = registration.v_org_id;
    this.v_owner_contact = registration.v_owner_contact;
    this.v_owner_address = registration.v_owner_address;
    this.is_org = registration.is_org;
    this.status = registration.status;

    // Optional nested user
    if (registration.user) {
      this.user = {
        id: registration.user.id,
        email: registration.user.email,
        firstName: registration.user.firstName,
        lastName: registration.user.lastName
      };
    }
  }
}

module.exports = RegistrationResponseDto;