// app/routes/logout.ts

import { FormEvent, useState } from "react";
import { Form, useNavigate } from "@remix-run/react";

import { useFirebaseAuth } from "~/hooks/useFirebaseAuth";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/LoadingSpinner";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { logout } = useFirebaseAuth();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // this will prevent Remix from submitting the form

    setIsLoading(true);

    try {
      await logout();
      console.log("User logged out successfully!");
      return navigate(`/login`);
    } catch (err) {
      console.log("logout", err);
      if (err instanceof Error) {
        setError(err);
      }
    }

    setIsLoading(false);
  }

  return (
    <div className="mx-auto mt-8 max-w-[400px]">
      <Form id="logout-form" onSubmit={onSubmit}>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <LoadingSpinner className="mr-2 size-4" />}
          Sign Out
        </Button>
      </Form>

      <div className="mt-2 flex flex-col items-center gap-2 text-sm text-red-600">
        {error ? error.message : null}
      </div>
    </div>
  );
}
