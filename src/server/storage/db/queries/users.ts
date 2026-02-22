import { db } from "./db";
import { users } from "../schema";

async function getUserById(userId: string) {
    return db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
    });
}

async function getUserByEmail(email: string) {
    return db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
    });
}

async function createUser(data: { email: string; password: string; name: string,phone:string }) {
    const [user] = await db.insert(users).values({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
    }).returning();
    return user;
}

export const userStore = {
    getUserById,
    getUserByEmail,
    createUser,
}