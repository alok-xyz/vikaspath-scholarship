// Admin Credentials Management Module

export const ADMIN_CREDENTIALS = {
  SYSTEM_ADMIN: {
    loginId: 'hoiadmin@ac.in',
    password: 'admin@2003',
    email: 'hoiadmin@ac.in',
    role: 'SYSTEM_ADMIN',
    name: 'System Administrator',
    accessLevel: 'FULL_ACCESS'
  },
  INSTITUTION_ADMINS: {
    KOLKATA_UNIVERSITY: {
      loginId: 'kuni@ac.in',
      password: 'alok@2003',
      email: 'kuni@ac.in',
      role: 'INSTITUTION_ADMIN',
      name: 'Kolkata University Admin',
      institution: 'KOLKATA_UNIVERSITY',
      accessLevel: 'INSTITUTION_ACCESS'
    },
    SANTIPUR_UNIVERSITY: {
      loginId: 'su@ac.in',
      password: 'alok@2003',
      email: 'su@ac.in',
      role: 'INSTITUTION_ADMIN',
      name: 'Santipur University Admin',
      institution: 'SANTIPUR_UNIVERSITY',
      accessLevel: 'INSTITUTION_ACCESS'
    },
    PPS_COLLEGE: {
      loginId: 'pps@ac.in',
      password: '@alok2003',
      email: 'pps@ac.in',
      role: 'INSTITUTION_ADMIN',
      name: 'PPS College Admin',
      institution: 'PPS_COLLEGE',
      accessLevel: 'INSTITUTION_ACCESS'
    }
  }
};

/**
 * Validate admin login credentials
 * @param {string} loginId - Login ID entered by user
 * @param {string} password - Password entered by user
 * @returns {Object|null} Admin user details if credentials are valid, null otherwise
 */
export function validateAdminLogin(loginId, password) {
  // Check System Admin
  if (
    loginId === ADMIN_CREDENTIALS.SYSTEM_ADMIN.loginId && 
    password === ADMIN_CREDENTIALS.SYSTEM_ADMIN.password
  ) {
    return {
      ...ADMIN_CREDENTIALS.SYSTEM_ADMIN,
      dashboardRoute: '/admin/system-admin-dashboard'
    };
  }

  // Check Institution Admins
  const institutions = Object.values(ADMIN_CREDENTIALS.INSTITUTION_ADMINS);
  const matchedInstitution = institutions.find(
    inst => inst.loginId === loginId && inst.password === password
  );

  if (matchedInstitution) {
    return {
      ...matchedInstitution,
      dashboardRoute: `/institution/${matchedInstitution.institution}-dashboard`
    };
  }

  // Invalid credentials
  return null;
};

/**
 * Get all admin login IDs
 * @returns {string[]} Array of valid login IDs
 */
export function getAllAdminLoginIds() {
  const systemAdminLoginId = ADMIN_CREDENTIALS.SYSTEM_ADMIN.loginId;
  const institutionLoginIds = Object.values(ADMIN_CREDENTIALS.INSTITUTION_ADMINS).map(
    inst => inst.loginId
  );
  
  return [systemAdminLoginId, ...institutionLoginIds];
}
