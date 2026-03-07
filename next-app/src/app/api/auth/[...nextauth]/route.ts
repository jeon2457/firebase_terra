import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                id: { label: "ID", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.id || !credentials?.password) {
                    throw new Error("ID와 비밀번호를 입력해주세요.");
                }

                await dbConnect();

                const user = await User.findOne({ id: credentials.id });

                if (!user) {
                    throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
                }

                // Note: Existing PHP uses password_hash/password_verify.
                // If passwords in MongoDB are hashed with bcrypt, this will work.
                // If they are plain text or other hash, we might need to adjust.
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
                }

                // Update login count and last login time
                user.login_count = (user.login_count || 0) + 1;
                user.last_login_at = new Date();
                await user.save();

                return { id: user.id, name: user.name, user_level: user.user_level, remark: user.remark };
            }
        })
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.id = user.id;
                token.user_level = user.user_level;
                token.remark = user.remark;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token) {
                session.user.id = token.id;
                session.user.user_level = token.user_level;
                session.user.remark = token.remark;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
