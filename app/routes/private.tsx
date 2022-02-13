import type { ActionFunction, LoaderFunction } from "remix";
import { Form } from "remix";
import { auth } from "~/auth.server";

export const action: ActionFunction = async ({ request }) => {
  await auth.logout(request, { redirectTo: "/login" });
};

export const loader: LoaderFunction = async ({ request }) => {
  await auth.isAuthenticated(request, {
    failureRedirect: "/login"
  });
  return null;
};

export default function Screen() {
  return (
    <>
      <h1>Hello</h1>

      <Form method="post">
        <button>Log Out</button>
      </Form>
    </>
  );
}
