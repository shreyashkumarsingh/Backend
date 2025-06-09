
const db = require('../models'); // make sure index.js in /models returns db with initialized models
const User = db.User;
const Registration = db.Registration;
const JWTConfig = require('../config/jwt');
const LoginRequestDTO = require('../dto/request/LoginRequestDTO');
const RegisterRequestDTO = require('../dto/request/RegisterRequestDTO');
const AuthResponseDTO = require('../dto/response/AuthResponseDTO');
const RegistrationDto = require('../dto/request/RegistrationDto');
const VehicleDto = require('../dto/request/VehicleRequestDTO');
const DriverRequestDTO = require('../dto/request/DriverRequestDTO');
const DriverStatusRequestDTO = require('../dto/request/DriverStatusRequestDTO');// adding the route

class AuthService {
  static async login(loginData) {
    const loginDTO = new LoginRequestDTO(loginData);
    const validation = loginDTO.validate();
    
    if (!validation.isValid) {                                                                               
      throw new Error(validation.errors.join(', '));
    }

    const user = await User.findOne({
      where: { email: loginDTO.email, isActive: true }
    });

    if (!user || !(await user.validatePassword(loginDTO.password))) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    
    // Generate tokens
    const accessToken = JWTConfig.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    const refreshToken = JWTConfig.generateRefreshToken({
      userId: user.id
    });

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return new AuthResponseDTO(user, accessToken, refreshToken);
  }

  static async register(registerData) {
    const registerDTO = new RegisterRequestDTO(registerData);
    const validation = registerDTO.validate();
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: registerDTO.email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user
    const user = await User.create({
      email: registerDTO.email,
      password: registerDTO.password,
      firstName: registerDTO.firstName,
      lastName: registerDTO.lastName
    });
  
    // Generate tokens
    const accessToken = JWTConfig.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    const refreshToken = JWTConfig.generateRefreshToken({
      userId: user.id
    });

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return new AuthResponseDTO(user, accessToken, refreshToken);
  }

  // REGISTER NEW 
  static async registerNew(registerData) {
    const registerDTO = new RegistrationDto(registerData);
    const validation = registerDTO.validate();
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: registerDTO.email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user
    const user = await User.create({
      email: registerDTO.email,
      password: registerDTO.password,
      firstName: registerDTO.firstName,
      lastName: registerDTO.lastName,
      role: 'user',
      isActive: registerDTO.isActive
    });

    const registration = await Registration.create({
      reg_id: registerDTO.reg_id,
      user_id: user.id,
      v_owner_name: registerDTO.v_owner_name,
      v_org_name: registerDTO.v_org_name,
      v_org_id: registerDTO.v_org_id,
      v_owner_contact: registerDTO.v_owner_contact,
      v_owner_address: registerDTO.v_owner_address,
      is_org: registerDTO.is_org,
      status: registerDTO.status
    });

    // Generate tokens
    const accessToken = JWTConfig.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    const refreshToken = JWTConfig.generateRefreshToken({
      userId: user.id
    });

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    await registration.reload();

    return new AuthResponseDTO(user, accessToken, refreshToken);
  }

  static async refreshToken(token) {
    if (!token) {
      throw new Error('Refresh token required');
    }

    const decoded = JWTConfig.verifyRefreshToken(token);
    
    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        refreshToken: token,
        isActive: true
      }
    });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const accessToken = JWTConfig.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    const newRefreshToken = JWTConfig.generateRefreshToken({
      userId: user.id
    });

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    return new AuthResponseDTO(user, accessToken, newRefreshToken);
  }
    
  static async logout(userId) {
    await User.update(
      { refreshToken: null },
      { where: { id: userId } }
    );
  }

  // =============driver_tbl new registration========================
 static async registerDriver(registerData, user) {
  const registerDTO = new DriverRequestDTO(registerData);
  const validation = registerDTO.validate();

  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // Create and save driver in database
  const createdDriver = await Driver.create({
    d_id: registerDTO.d_id,
    license_no: registerDTO.license_no,
    d_name: registerDTO.d_name,
    v_owner_name: registerDTO.v_owner_name,
    v_org_name: registerDTO.v_org_name,
    v_org_id: registerDTO.v_org_id,
    d_status: registerDTO.d_status,
    address: registerDTO.address || null // if address was added to DTO
  });

  // Optional: associate with user (if needed)
  console.log('Created by user:', user?.id);

  // Return response DTO
  const DriverResponseDTO = require('../dto/response/DriverResponseDTO');
  return new DriverResponseDTO(createdDriver);
}


// =============vehicle_tbl new registration========================

  static async registerVehicle(registerData, user) {
  const {
    v_id,
    v_owner_name,
    special_type,
    v_number,
    license_number,
    v_category,
    commercial_type,
    v_type,
    registration_date,
    created_at,
    status
  } = registerData;

  const errors = [];

  // Validate required fields
  if (!v_id) errors.push('Vehicle ID (v_id) is required');
  if (!v_owner_name) errors.push('Owner name is required');
  if (!v_number) errors.push('Vehicle number is required');
  if (!license_number) errors.push('License number is required');
  if (!v_category) errors.push('Vehicle category is required');
  if (!v_type) errors.push('Vehicle type is required');
  if (!status) errors.push('Status is required');

  // Enum validations
  const allowedSpecialTypes = ['Ambulance', 'Mortuary Van'];
  const allowedVCategories = ['Commercial', 'Non-Commercial'];
  const allowedCommercialTypes = ['Cargo', 'Passenger'];
  const allowedVTypes = ['Bus', '4-Wheeler', 'Special'];

  if (special_type && !allowedSpecialTypes.includes(special_type)) {
    errors.push(`Special type must be one of: ${allowedSpecialTypes.join(', ')}`);
  }

  if (!allowedVCategories.includes(v_category)) {
    errors.push(`Vehicle category must be one of: ${allowedVCategories.join(', ')}`);
  }

  if (v_category === 'Commercial') {
    if (!commercial_type || !allowedCommercialTypes.includes(commercial_type)) {
      errors.push(`Commercial type must be one of: ${allowedCommercialTypes.join(', ')}`);
    }
  }

  if (!allowedVTypes.includes(v_type)) {
    errors.push(`Vehicle type must be one of: ${allowedVTypes.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  // Save to DB
  const createdVehicle = await Vehicle.create({
    v_id,
    v_owner_name,
    special_type: special_type || null,
    v_number,
    license_number,
    v_category,
    commercial_type: commercial_type || null,
    v_type,
    registration_date: registration_date || new Date(),
    created_at: created_at || new Date(),
    status
  });

  // Optional: associate with user
  console.log('Vehicle registered by user:', user?.id);

  return createdVehicle; // Or wrap in a DTO if needed
}
//======================driver status table ================================================
static async driverstatus(registerData, user) {
  const registerDTO = new DriverStatusRequestDTO(registerData);
  const validation = registerDTO.validate();

  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // Extract fields
  const { reg_id, d_id, Phone_no, Status } = registerDTO;

  const errors = [];

  // Field validation
  if (!reg_id) errors.push('Registration ID (reg_id) is required');
  if (!d_id) errors.push('Driver ID (d_id) is required');
  if (!Phone_no || !/^[6-9]\d{9}$/.test(Phone_no)) {
    errors.push('Valid Phone number is required');
  }

  const allowedStatuses = ['Active', 'Inactive'];
  if (!allowedStatuses.includes(Status)) {
    errors.push(`Status must be one of: ${allowedStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  // Create entry in driver_status_tbl
  const DriverStatus = db.DriverStatus; // Assuming model is named like this

  const createdStatus = await DriverStatus.create({
    reg_id,
    d_id,
    Phone_no,
    Status
  });

  // Optional: associate with user
  console.log('Driver status registered by user:', user?.id);

  // Return DTO or raw object
  return createdStatus; // Or wrap with response DTO if needed
}





}

module.exports = AuthService;