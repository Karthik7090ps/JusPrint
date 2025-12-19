import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { setSecureItem, getSecureItem, deleteSecureItem, STORAGE_KEYS } from '../../utils/secureStorage';
import { authService } from '../../services/authService';

interface AuthState {
    name: string;
    balance: number;
    isAuthenticated: boolean;
    userId: string | null;
    isLoading: boolean;
    campusCode: string | null;
    campusName: string | null;
}

const initialState: AuthState = {
    name: 'User',
    balance: 450.00,
    isAuthenticated: false,
    userId: null,
    isLoading: true, // Start with loading to check stored auth
    campusCode: null,
    campusName: null,
};

/**
 * Async Thunks for Secure Token Operations
 */

// Check if user has a stored session on app launch
export const checkStoredAuth = createAsyncThunk(
    'auth/checkStoredAuth',
    async (_, { dispatch }) => {
        // Add a slight delay for splash screen visibility
        await new Promise(resolve => setTimeout(() => resolve(null), 1500));

        const userId = await getSecureItem(STORAGE_KEYS.USER_ID);
        const accessToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = await getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
        const storedName = await getSecureItem(STORAGE_KEYS.USER_NAME);
        const campusCode = await getSecureItem(STORAGE_KEYS.CAMPUS_CODE);
        const campusName = await getSecureItem(STORAGE_KEYS.CAMPUS_NAME);

        if (!accessToken || !userId) {
            return { userId: null, name: null, campusCode, campusName, isValid: false };
        }

        // 1. Try to verify the existing access token
        const verifyRes = await authService.verifyToken(accessToken);

        if (verifyRes.success) {
            return {
                userId: verifyRes.userId || userId,
                name: verifyRes.name || storedName,
                campusCode,
                campusName,
                isValid: true
            };
        }

        // 2. Access token expired/invalid, try to refresh if we have a refresh token
        if (refreshToken) {
            console.log('[AUTH_SLICE] Access token invalid, attempting refresh');
            const refreshRes = await authService.refreshAccessToken(refreshToken);

            if (refreshRes.success && refreshRes.token) {
                // Store the new access token
                await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, refreshRes.token);

                // Now verify the new token to get user details
                const newVerifyRes = await authService.verifyToken(refreshRes.token);
                if (newVerifyRes.success) {
                    return {
                        userId: newVerifyRes.userId || userId,
                        name: newVerifyRes.name || storedName,
                        campusCode,
                        campusName,
                        isValid: true
                    };
                }
            }
        }

        // 3. Everything failed, purge storage and log out
        console.log('[AUTH_SLICE] Auth check failed completely, logging out');
        await dispatch(logoutUser());
        return { userId: null, name: null, campusCode: null, campusName: null, isValid: false };
    }
);

// Login and store tokens securely
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { userId: string; accessToken: string; refreshToken: string }) => {
        // Store tokens securely
        await setSecureItem(STORAGE_KEYS.USER_ID, credentials.userId);
        await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, credentials.accessToken);
        await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, credentials.refreshToken);

        return { userId: credentials.userId };
    }
);

// Logout and clear stored tokens
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async () => {
        await deleteSecureItem(STORAGE_KEYS.USER_ID);
        await deleteSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        await deleteSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
        await deleteSecureItem(STORAGE_KEYS.USER_NAME);
        await deleteSecureItem(STORAGE_KEYS.CAMPUS_CODE);
        await deleteSecureItem(STORAGE_KEYS.CAMPUS_NAME);

        return true;
    }
);

// Update user name and persist it
export const updateUserName = createAsyncThunk(
    'auth/updateUserName',
    async (name: string) => {
        await setSecureItem(STORAGE_KEYS.USER_NAME, name);
        return name;
    }
);

// Set selected campus and persist it
export const selectCampus = createAsyncThunk(
    'auth/selectCampus',
    async (campus: { code: string; name: string }) => {
        await setSecureItem(STORAGE_KEYS.CAMPUS_CODE, campus.code);
        await setSecureItem(STORAGE_KEYS.CAMPUS_NAME, campus.name);
        return campus;
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setBalance: (state, action: PayloadAction<number>) => {
            state.balance = action.payload;
        },
        updateName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        // For demo/development: quick auth toggle
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Check stored auth
        builder
            .addCase(checkStoredAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkStoredAuth.fulfilled, (state, action) => {
                state.isAuthenticated = action.payload.isValid;
                state.userId = action.payload.userId;
                state.campusCode = action.payload.campusCode;
                state.campusName = action.payload.campusName;
                // Try to get name from storage or set default
                if (action.payload.isValid) {
                    state.name = action.payload.name || 'User';
                }
                // Short delay to ensure splash is visible
                state.isLoading = false;
            })
            .addCase(checkStoredAuth.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
            });

        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.userId = action.payload.userId;
            })
            .addCase(loginUser.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
            });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.isAuthenticated = false;
            state.userId = null;
            state.name = 'Guest';
            state.balance = 0;
            state.campusCode = null;
            state.campusName = null;
        });

        // Update Name
        builder.addCase(updateUserName.fulfilled, (state, action) => {
            state.name = action.payload;
        });

        // Select Campus
        builder.addCase(selectCampus.fulfilled, (state, action) => {
            state.campusCode = action.payload.code;
            state.campusName = action.payload.name;
        });
    },
});

export const { setBalance, updateName, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
