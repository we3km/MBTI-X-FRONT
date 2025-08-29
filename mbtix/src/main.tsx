import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store/store.ts'

const queryClient = new QueryClient(); // 전역 캐시 저장소

createRoot(document.getElementById('root')!).render(
  <>
      {/* 모든 컴포넌트에 queryClient를 제공하는 컴포넌트 */}
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    </>
)
