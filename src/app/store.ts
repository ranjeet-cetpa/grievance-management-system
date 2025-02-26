import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';
import localStorage from 'redux-persist/lib/storage'; // Ensure this is imported correctly
import { combineReducers } from 'redux';
import employeeReducer from '../features/employee/employeeSlice';
import userReducer from '../features/user/userSlice';

// Define persist configurations
const sessionPersistConfig = {
  key: 'root',
  storage: sessionStorage, // Use session storage for most reducers
  whitelist: ['employee', 'user', 'units'], // Persist these slices
};

const securityPersistConfig = {
  key: 'securityInfo',
  storage: localStorage, // Use local storage specifically for securityInfo
};

const rootReducer = combineReducers({
  employee: employeeReducer,
  user: userReducer,
});

const persistedReducer = persistReducer(sessionPersistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for Redux Persist
    }),
});

export default store;
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
