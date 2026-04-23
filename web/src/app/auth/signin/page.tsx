'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth/auth-client';

/**
 * Validates callback URL to prevent open redirect attacks.
 * Only allows relative, same-origin paths.
 */
function validateCallbackUrl(url: string | null): string {
  if (!url) return '/dashboard';
  if (url.startsWith('//')) return '/dashboard';
  if (!url.startsWith('/')) return '/dashboard';
  if (url.toLowerCase().match(/^\/*(data|javascript):/i)) return '/dashboard';
  return url;
}

function SignInForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = validateCallbackUrl(searchParams.get('callbackUrl'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError('');

    // AC-10 — client-side validation stops an empty submission before it
    // reaches NextAuth. Messages are in plain English.
    if (!email.trim() || !password) {
      if (!email.trim() && !password) {
        setError('Email is required. Password is required.');
      } else if (!email.trim()) {
        setError('Email is required.');
      } else {
        setError('Password is required.');
      }
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else if (result.networkError) {
        // BA-2 Option A — clear password on network error.
        setPassword('');
        setError('Sign-in could not be completed. Please try again.');
      } else {
        // BA-2 Option A — clear password on invalid credentials; preserve email.
        setPassword('');
        setError('The email or password is incorrect.');
      }
    } catch {
      setPassword('');
      setError('Sign-in could not be completed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl tracking-tight">BetterBond</CardTitle>
          <CardDescription>
            Sign in to the Commission Payments console
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@betterbond.example"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                aria-label="Email"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                aria-label="Password"
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-label={isLoading ? 'Signing in' : 'Sign in'}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function SignInPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div>Loading…</div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
