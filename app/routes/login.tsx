// app/routes/login.tsx

import { FormEvent, SVGProps, useState } from "react";
import { LinksFunction } from "@remix-run/cloudflare";
import { Form, Link, useNavigate } from "@remix-run/react";
import { useFirebase } from "~/context/FirebaseContext";

import { useFirebaseAuth } from "~/hooks/useFirebaseAuth";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { LoadingSpinner } from "~/components/LoadingSpinner";

export const links: LinksFunction = () => {
  return [];
};

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { loginWithEmailAndPassword, loginWithGoogle } = useFirebaseAuth();
  const { user } = useFirebase();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // this will prevent Remix from submitting the form

    setIsLoading(true);

    // read form elements
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      email: HTMLInputElement;
      password: HTMLInputElement;
    };

    const email = formElements.email.value;
    const password = formElements.password.value;

    try {
      await loginWithEmailAndPassword(email, password);
      console.log("User logged in with email and password successfully!");
      return navigate(`/`);
    } catch (err) {
      console.log("loginWithEmailAndPassword", err);
      if (err instanceof Error) {
        setError(err);
      }
    }

    setIsLoading(false);
  }

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      await loginWithGoogle();
      console.log("User logged in with google successfully!");
    } catch (err) {
      console.log("loginWithGoogle", err);
      if (err instanceof Error) {
        setError(err);
      }
    }

    setIsLoading(false);

    return navigate(`/`);
  };

  return (
    <div className="mx-auto mt-8 max-w-[400px]">
      <Form id="login-form" onSubmit={onSubmit}>
        <Card className="w-full max-w-md">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">Login</CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <LoadingSpinner className="mr-2 size-4" />}
              Sign In with Email
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
              <span className="mx-4 text-gray-500 dark:text-gray-400">Or</span>
              <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
            </div>
            <div className="w-full">
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => signInWithGoogle()}
                disabled={isLoading}>
                {isLoading ? (
                  <LoadingSpinner className="mr-2 size-4" />
                ) : (
                  <ChromeIcon className="mr-2 size-4" />
                )}{" "}
                Sign In with Google
              </Button>
            </div>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              Don{"'"}t have an account?{" "}
              <Link
                to="/register"
                className="font-medium underline"
                prefetch="none">
                Register
              </Link>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Or have you{" "}
              <Link to="/forgot" className="font-medium underline">
                forgotten your password?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Form>

      <div className="my-2 flex flex-col items-center gap-2 text-sm text-red-600">
        {error ? error.message : null}
      </div>

      {user?.email && (
        <div className="flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex flex-row gap-2">
            <div>Logged in as:</div>
            {user?.displayName && (
              <div className="text-blue-600">{user?.displayName}</div>
            )}
            <div className="text-blue-600">{user?.email ?? ""}</div>
          </div>
          <div className="text-center">
            Do you want to{" "}
            <Link to="/logout" className="font-medium underline">
              Log Out?
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ChromeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" x2="12" y1="8" y2="8" />
      <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
      <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
    </svg>
  );
}
