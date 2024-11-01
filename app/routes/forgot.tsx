// app/routes/forgot.tsx

import { FormEvent, useState } from "react";
import { LinksFunction } from "@remix-run/cloudflare";
import { Form, Link, useNavigate } from "@remix-run/react";

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

export default function ForgottenPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { sendForgottenPasswordEmail } = useFirebaseAuth();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // this will prevent Remix from submitting the form

    setIsLoading(true);

    // read form elements
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      email: HTMLInputElement;
    };

    const email = formElements.email.value;

    try {
      await sendForgottenPasswordEmail(email);
      console.log("Forgotten epost sent successfully!");
      return navigate(`/login`);
    } catch (err) {
      console.log("sendForgottenPasswordEmail", err);
      if (err instanceof Error) {
        setError(err);
      }
    }

    setIsLoading(false);
  }

  return (
    <div className="mx-auto mt-8 max-w-[400px] ">
      <Form id="forgotten-form" method="post" onSubmit={onSubmit}>
        <Card className="w-full max-w-md">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">
              Forgotten Password?
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Enter your email address to reset the password
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <LoadingSpinner className="mr-2 size-4" />}
              Request Password Reset Link
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Not Yet{" "}
              <Link to="/register" className="font-medium underline">
                Registered?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Form>

      {/* Display error if exists */}
      {error && (
        <p className="mt-1 flex w-full items-center justify-center text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
}
