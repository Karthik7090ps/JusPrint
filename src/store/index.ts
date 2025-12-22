import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import printReducer from './slices/printSlice';
import printerReducer from './slices/printerSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        print: printReducer,
        printer: printerReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
