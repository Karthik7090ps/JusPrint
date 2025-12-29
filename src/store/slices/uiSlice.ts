import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    offlineBannerVisible: boolean;
}

const initialState: UiState = {
    offlineBannerVisible: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setOfflineBannerVisible: (state, action: PayloadAction<boolean>) => {
            state.offlineBannerVisible = action.payload;
        },
    },
});

export const { setOfflineBannerVisible } = uiSlice.actions;
export default uiSlice.reducer;
