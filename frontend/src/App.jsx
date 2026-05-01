import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import Home from './pages/Home';
import History from './pages/History';
import Analytics from './pages/Analytics';
import { useToast } from './hooks/useToast';

export default function App() {
  const { toasts, toast, dismiss } = useToast();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home toast={toast} />} />
            <Route path="/history" element={<History toast={toast} />} />
            <Route path="/analytics" element={<Analytics toast={toast} />} />
          </Routes>
        </main>
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </BrowserRouter>
  );
}
