import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const App = () => {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 3000, position: 'top-right' }} />
      <AppRoutes />
    </div>
  );
};

export default App;
