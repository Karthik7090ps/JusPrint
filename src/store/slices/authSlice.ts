import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { setSecureItem, getSecureItem, deleteSecureItem, STORAGE_KEYS } from '../../utils/secureStorage';

interface AuthState {
    name: string;
    balance: number;
    isAuthenticated: boolean;
    userId: string | null;
    isLoading: boolean;
}

const initialState: AuthState = {
    name: 'User',
    balance: 450.00,
    isAuthenticated: false,
    userId: null,
    isLoading: true, // Start with loading to check stored auth
};

/**
 * Async Thunks for Secure Token Operations
 */

// Check if user has a stored session on app launch
export const checkStoredAuth = createAsyncThunk(
    'auth/checkStoredAuth',
    async () => {
        // Add a slight delay for splash screen visibility
        await new Promise(resolve => setTimeout(() => resolve(null), 1500));

        const userId = await getSecureItem(STORAGE_KEYS.USER_ID);
        const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        const name = await getSecureItem(STORAGE_KEYS.USER_NAME);

        if (userId && token) {
            // In production, validate token with backend here
            return { userId, name, isValid: true };
        }
        return { userId: null, name: null, isValid: false };
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
        });

        // Update Name
        builder.addCase(updateUserName.fulfilled, (state, action) => {
            state.name = action.payload;
        });
    },
});

export const { setBalance, updateName, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
