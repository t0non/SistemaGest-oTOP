'use client';

import {useFormState, useFormStatus} from 'react-dom';
import {signIn} from '@/lib/auth-actions';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {AlertCircle, LogIn} from 'lucide-react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Entrando...' : 'Entrar'}
      <LogIn className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(signIn, undefined);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@topinfo.bh"
              required
              defaultValue="admin@topinfo.bh"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="admin123"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de Autenticação</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
