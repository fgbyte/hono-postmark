import { db } from "@hono-postmark/db";
import * as schema from "@hono-postmark/db/schema/auth";
import { env } from "@hono-postmark/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendEmail } from "@hono-postmark/mail";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ( { user, url, token }, request) => {
          void sendEmail({
            to: user.email,
            subject: "Verify your email address",
            text: `Click the link to verify your email: ${url}`,
          });
        },
    }
  // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 60,
  //   },
  // },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
    // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: "<your-workers-subdomain>",
    // },
  },
});
