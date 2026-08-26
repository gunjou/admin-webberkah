// =========================================================
// ROLES
// =========================================================

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  FINANCE: "FINANCE",
  CONTRACT: "CONTRACT",
  HR: "HR",
  K3: "K3",
  INVOICE: "INVOICE",
};

// =========================================================
// ROLE GROUPS
// =========================================================

export const ROLE_GROUPS = {
  ALL: [
    ROLES.SUPER_ADMIN,
    ROLES.FINANCE,
    ROLES.CONTRACT,
    ROLES.HR,
    ROLES.K3,
    ROLES.INVOICE,
  ],

  HRIS: [ROLES.SUPER_ADMIN, ROLES.FINANCE, ROLES.HR],

  CONTRACT: [ROLES.SUPER_ADMIN, ROLES.CONTRACT],

  INVOICE: [ROLES.SUPER_ADMIN, ROLES.INVOICE],

  CLIENT: [
    ROLES.SUPER_ADMIN,
    ROLES.FINANCE,
    ROLES.CONTRACT,
    ROLES.HR,
    ROLES.INVOICE,
  ],
};

// =========================================================
// GET JWT PAYLOAD
// =========================================================

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );

    return payload;
  } catch (error) {
    console.error("Gagal membaca JWT:", error);

    return null;
  }
};

// =========================================================
// GET USER ROLE
// =========================================================

export const getUserRole = () => {
  const user = getUserFromToken();

  return user?.role || null;
};

// =========================================================
// CHECK ROLE
// =========================================================

export const hasRole = (allowedRoles = []) => {
  const role = getUserRole();

  if (!role) {
    return false;
  }

  return allowedRoles.includes(role);
};

// =========================================================
// CHECK ACCESS
// =========================================================

export const hasAccess = (allowedRoles = []) => {
  const role = getUserRole();

  if (!role) {
    return false;
  }

  // SUPER ADMIN selalu memiliki akses
  if (role === ROLES.SUPER_ADMIN) {
    return true;
  }

  return allowedRoles.includes(role);
};

// =========================================================
// DEFAULT ROUTE PER ROLE
// =========================================================

export const getDefaultRoute = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "/dashboard";

    case ROLES.FINANCE:
      return "/dashboard";

    case ROLES.HR:
      return "/dashboard";

    case ROLES.CONTRACT:
      return "/dashboard-contract";

    case ROLES.INVOICE:
      return "/dashboard-invoice";

    case ROLES.K3:
      return "/unauthorized";

    default:
      return "/unauthorized";
  }
};
