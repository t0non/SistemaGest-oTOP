import {LoginForm} from '@/components/auth/login-form';
import {Bot} from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-primary text-primary-foreground rounded-full p-4">
            <Bot size={40} />
          </div>
        </div>
        <h1 className="text-3xl font-headline text-center font-bold mb-2 text-gray-800 dark:text-gray-200">
          TechStore Manager BH
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Acesse o painel de controle
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
