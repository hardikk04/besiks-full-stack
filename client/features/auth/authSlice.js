import { createSlice } from "@reduxjs/toolkit";

// Function to get initial state from localStorage
const getInitialState = () => {
  if (typeof window === "undefined") {
    // Server-side rendering
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  // Client-side
  try {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      return {
        user: JSON.parse(userData),
        token: token,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Error loading auth state from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    },
  },
});

export default authSlice.reducer;
export const { setCredentials, logout } = authSlice.actions;
