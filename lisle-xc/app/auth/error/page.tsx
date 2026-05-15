import Link from 'next/link';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '@/components/Button';

export default function AuthError() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-background border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        
        <p className="text-light-gray mb-8">
          Your account does not have permission to access the coach dashboard. 
          Please ensure you are signed in with an authorized coach email.
        </p>

        <div className="flex flex-col gap-4">
          <Button 
            as={Link} 
            href="/api/auth/signin"
            isActive={true}
            size="md"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Different Account
          </Button>

          <Button 
            as={Link} 
            href="/"
            isActive={false}
            size="md"
            className="bg-transparent text-foreground border border-border shadow-none hover:bg-light-blue-gray/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </main>
  );
}