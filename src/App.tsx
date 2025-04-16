import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PreventBackNavigation from './components/PreventBackNavigation';
const App = () => {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 3000, position: 'top-right' }} />
      <PreventBackNavigation />
      <AppRoutes />
    </div>
  );
};

export default App;
