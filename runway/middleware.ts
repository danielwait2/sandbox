import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith("/api/auth")) {
        return true;
      }

      return Boolean(token);
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
