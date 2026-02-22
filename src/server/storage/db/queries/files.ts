import { eq } from "drizzle-orm";
import { db } from "./db";
import { files } from "../schema";

export const fileStore = {
    async saveFile(fileData: { userId: string; public_id: string; media_url: string; resource_type: string, description?: string }) {
        const { userId, public_id, media_url, resource_type, description } = fileData
        const newFile = await db.insert(files).values({
            userId,
            public_id,
            media_url,
            resource_type,
            description
        }).returning()
        return newFile[0]
    },

    async getFileByPublicId(public_id: string) {
        return await db.select().from(files).where(eq(files.public_id, public_id)).limit(1).then(res => res[0] || null)
    },

    async getFilesByUserId(userId: string) {
        return await db.select().from(files).where(eq(files.userId, userId))
    },

    async deleteFileByPublicId(public_id: string) {
        return await db.delete(files).where(eq(files.public_id, public_id)).returning()
    },
}