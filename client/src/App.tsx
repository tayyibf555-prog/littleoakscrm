import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { AppRoutes } from '@/routes';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <TooltipProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
