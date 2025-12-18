import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import printReducer from './slices/printSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        print: printReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
