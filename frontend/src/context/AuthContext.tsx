"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import apiClient from "@/utils/api/apiClient";

// =======================================
// TYPES
// =======================================

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active?: boolean;
  email_verified?: boolean;
  two_factor_enabled?: boolean;

}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;

  loading: boolean;

  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<AuthResult>;

  signup: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<AuthResult>;

  resendVerificationEmail: (
    email: string
  ) => Promise<AuthResult>;

  verifyAndLogin: (
    token: string
  ) => Promise<AuthResult>;
  updateProfile: (
    data: {
      name?: string;
      email?: string;
      phone?: string;
    }
  ) => Promise<AuthResult>;

  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<AuthResult>;

  deactivateAccount: (
    password: string
  ) => Promise<AuthResult>;

  deleteAccount: (
    password: string
  ) => Promise<AuthResult>;

  logout: () => void;

  refreshUser: () => Promise<void>;

  hasRole: (...roles: string[]) => boolean;
}

// =======================================
// CONTEXT
// =======================================

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

// =======================================
// STORAGE KEYS
// =======================================

export const TOKEN_KEY =
  "vendorhub_token";

export const REMEMBER_KEY =
  "vendorhub_remember";

// =======================================
// GET STORED TOKEN
// =======================================

 export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const localToken =
    localStorage.getItem(TOKEN_KEY);

  if (localToken) {
    return localToken;
  }

  const sessionToken =
    sessionStorage.getItem(TOKEN_KEY);

  if (sessionToken) {
    return sessionToken;
  }

  return null;
};

// =======================================
// STORE TOKEN
// =======================================

const storeToken = (
  token: string,
  rememberMe: boolean
) => {
  if (typeof window === "undefined") {
    return;
  }

  // Always clear both storages first.

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REMEMBER_KEY);

  if (rememberMe) {
    // Remember Me ON
    localStorage.setItem(
      TOKEN_KEY,
      token
    );

    localStorage.setItem(
      REMEMBER_KEY,
      "true"
    );

    console.log(
      "Token stored in LOCAL STORAGE"
    );
  } else {
    // Remember Me OFF
    sessionStorage.setItem(
      TOKEN_KEY,
      token
    );

    sessionStorage.setItem(
      REMEMBER_KEY,
      "false"
    );

    console.log(
      "Token stored in SESSION STORAGE"
    );
  }
};

// =======================================
// CLEAR TOKEN
// =======================================

const clearStoredToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REMEMBER_KEY);
};

// =======================================
// AUTH PROVIDER
// =======================================

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const router = useRouter();

  // =====================================
  // FETCH CURRENT USER
  // =====================================

  const fetchCurrentUser = async (
    token: string
  ) => {
    try {
      const res =
        await apiClient.get(
          "/auth/me",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setUser(res.data);
    } catch (error: any) {
      console.error(
        "Failed to fetch current user:",
        error
      );

      // Invalid/expired JWT.
      clearStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // RESEND VERIFICATION EMAIL
  // =====================================

  const resendVerificationEmail =
    async (
      email: string
    ): Promise<AuthResult> => {
      try {
        await apiClient.post(
          "/auth/resend-verification",
          null,
          {
            params: {
              email: email.trim(),
            },
          }
        );

        return {
          success: true,
        };
      } catch (error: any) {
        console.error(
          "Resend verification error:",
          error
        );

        return {
          success: false,
          error:
            error.response?.data
              ?.detail ||
            error.response?.data
              ?.message ||
            "Failed to resend verification email.",
        };
      }
    };

  const verifyAndLogin = async (
    token: string
  ): Promise<AuthResult> => {
    try {
      const response = await apiClient.get(
        "/auth/verify-email",
        {
          params: { token },
        }
      );

      const data = response.data;

      if (!data?.access_token || !data?.user) {
        return {
          success: false,
          error: "Invalid verification response.",
        };
      }

      // Store verified user's JWT.
      // Verification is effectively a login, so remember it
      // for the current browser session.
      storeToken(
        data.access_token,
        true
      );

    setUser(data.user);

if (data.user.role === "buyer") {
  router.push("/");
}

if (data.user.role === "vendor") {
  router.push("/vendor");
}

if (data.user.role === "admin") {
  router.push("/admin");
}

return {
  success: true,
};
    } catch (error: any) {
      console.error(
        "Email verification error:",
        error
      );

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Unable to verify your email.",
      };
    }
  };

  // =====================================
  // CHECK EXISTING SESSION
  // =====================================

  useEffect(() => {
    const token =
      getStoredToken();

    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  // =====================================
  // LOGIN
  // =====================================

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<AuthResult> => {
    try {
      const res =
        await apiClient.post(
          "/auth/login",
          {
            email: email.trim(),
            password,
          }
        );

      const data = res.data;

      // ---------------------------------
      // Validate server response
      // ---------------------------------

      if (
        !data?.access_token ||
        !data?.user
      ) {
        return {
          success: false,
          error:
            "Invalid response from server.",
        };
      }

      // ---------------------------------
      // Store JWT
      // ---------------------------------

      storeToken(
        data.access_token,
        rememberMe
      );

      // ---------------------------------
      // Set logged-in user
      // ---------------------------------

      setUser(data.user);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(
        "Login error:",
        error
      );

      const detail =
        error.response?.data?.detail;

      // FastAPI can return a string
      // directly in detail.
      if (typeof detail === "string") {
        return {
          success: false,
          error: detail,
        };
      }

      return {
        success: false,
        error:
          error.response?.data
            ?.message ||
          "Unable to login. Please check your email and password.",
      };
    }
  };

  // =====================================
  // SIGNUP
  // =====================================

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<AuthResult> => {
    try {
      const res =
        await apiClient.post(
          "/auth/signup",
          {
            name,
            email,
            password,
            role,
          }
        );

      const data = res.data;

      if (!data?.user) {
        return {
          success: false,
          error:
            "Invalid response from server.",
        };
      }

      // ---------------------------------
      // IMPORTANT:
      // Signup does NOT log the user in.
      // User must verify email first.
      // ---------------------------------

      clearStoredToken();

      setUser(null);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(
        "Signup error:",
        error
      );

      const detail =
        error.response?.data?.detail;

      if (typeof detail === "string") {
        return {
          success: false,
          error: detail,
        };
      }

      return {
        success: false,
        error:
          error.response?.data
            ?.message ||
          "Signup failed.",
      };
    }
  };
    // =====================================
  // UPDATE PROFILE
  // =====================================

  const updateProfile = async (
    data: {
      name?: string;
      email?: string;
      phone?: string;
    }
  ): Promise<AuthResult> => {
    try {
      const res = await apiClient.put(
        "/auth/profile",
        data
      );

      setUser(res.data);

      return {
        success: true,
      };

    } catch (error: any) {
      console.error(
        "Update profile error:",
        error
      );

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Failed to update profile.",
      };
    }
  };
    // =====================================
// CHANGE PASSWORD
// =====================================

const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<AuthResult> => {
  try {
    await apiClient.put(
      "/auth/change-password",
      {
        current_password: currentPassword,
        new_password: newPassword,
      }
    );

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(
      "Change password error:",
      error
    );

    return {
      success: false,
      error:
        error.response?.data?.detail ||
        "Failed to change password.",
    };
  }
};
    // =====================================
  // DEACTIVATE ACCOUNT
  // =====================================

  const deactivateAccount = async (
    password: string
  ): Promise<AuthResult> => {
    try {
      await apiClient.post(
        "/auth/deactivate",
        {
          password,
        }
      );

      clearStoredToken();
      setUser(null);

      return {
        success: true,
      };

    } catch (error: any) {
      console.error(
        "Deactivate account error:",
        error
      );

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Failed to deactivate account.",
      };
    }
  };
    // =====================================
  // DELETE ACCOUNT
  // =====================================

  const deleteAccount = async (
    password: string
  ): Promise<AuthResult> => {
    try {
      await apiClient.delete(
        "/auth/account",
        {
          data: {
            password,
          },
        }
      );

      clearStoredToken();
      setUser(null);

      return {
        success: true,
      };

    } catch (error: any) {
      console.error(
        "Delete account error:",
        error
      );

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Failed to delete account.",
      };
    }
  };

  // =====================================
  // LOGOUT
  // =====================================

  const logout = () => {
    clearStoredToken();

    setUser(null);

    router.push("/login");
  };

  // =====================================
  // REFRESH USER
  // =====================================

  const refreshUser = async () => {
    const token =
      getStoredToken();

    if (!token) {
      setUser(null);
      return;
    }

    await fetchCurrentUser(token);
  };

  // =====================================
  // ROLE ACCESS
  // =====================================

  const hasRole = (
    ...roles: string[]
  ) => {
    if (!user) {
      return false;
    }

    return roles.some(
      (role) =>
        role.toLowerCase() ===
        user.role.toLowerCase()
    );
  };

  // =====================================
  // PROVIDER
  // =====================================

  return (
<AuthContext.Provider
  value={{
    user,
    loading,
    login,
    signup,
    resendVerificationEmail,
    verifyAndLogin,
    updateProfile,
    changePassword,
    deactivateAccount,
    deleteAccount,
    logout,
    refreshUser,
    hasRole,
  }}
>
      {children}
    </AuthContext.Provider>
  );
}

// =======================================
// USE AUTH
// =======================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}