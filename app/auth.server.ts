import { createSessionStorage } from "remix";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { db } from "~/db.server";
import crypto from 'crypto';

function createDatabaseSessionStorage({ cookie }: { cookie: any }) {
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const token = crypto.randomBytes(64).toString('hex');
      const session = await db.session.create({ data: { token } });
      return session.token;
    },
    async readData(token) {
      return (await db.session.findUnique({ where: { token }})) || null;
    },
    async updateData(token, data, expires) {
      await db.session.update({ where: { token }, data })
    },
    async deleteData(token) {
      await db.session.delete({ where: { token }})
    }
  });
}


export const sessionStorage = createDatabaseSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cret"], // This should be an env variable
    secure: process.env.NODE_ENV === "production"
  }
});

export const auth = new Authenticator<string>(sessionStorage, { sessionKey: 'token' });

auth.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    // replace the code below with your own authentication logic
    if (!password) throw new AuthorizationError("Password is required");
    if (password !== "test") {
      throw new AuthorizationError("Invalid credentials");
    }
    if (!email) throw new AuthorizationError("Email is required");

    return email as string;
  })
);
