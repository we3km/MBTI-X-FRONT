import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store.ts';
import { Toaster } from 'react-hot-toast';


import { setupInterceptors as setupApiClientInterceptors } from './api/apiClient.ts';

const queryClient = new QueryClient();

setupApiClientInterceptors(store);

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                    <Toaster position='top-center' />
                </BrowserRouter>
            </Provider>
        </QueryClientProvider>
    </React.StrictMode>
);