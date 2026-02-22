import { eq } from 'drizzle-orm'
import { db } from './db'
import { carPhotos } from '../schema'

export const carPhotoStore = {
    async getCarPhotos(carId: string) {
        return await db.select().from(carPhotos).where(eq(carPhotos.carId, carId));
    },

    async getCarPhotoById(photoId: string) {
        return await db.select().from(carPhotos).where(eq(carPhotos.id, photoId)).limit(1).then(res => res[0] || null);
    },

    async createCarPhoto(photoData: { carId: string; photoId: string; description?: string; isPrimary?: boolean }) {
        const { carId, photoId, description, isPrimary = false } = photoData;
        const newPhoto = await db.insert(carPhotos).values({
            carId,
            photoId,
            description,
            isPrimary,
        }).returning();
        return newPhoto[0];
    },

    async deleteCarPhoto(photoId: string) {
        return await db.delete(carPhotos).where(eq(carPhotos.id, photoId)).returning();
    },

    async updateCarPhotoPrimary(photoId: string, isPrimary: boolean) {
        return await db.update(carPhotos).set({ isPrimary }).where(eq(carPhotos.id, photoId)).returning();
    },

    async setPrimaryPhoto(carId: string, photoId: string) {
        // Set all other photos as non-primary
        await db.update(carPhotos).set({ isPrimary: false }).where(eq(carPhotos.carId, carId));
        // Set this photo as primary
        return await db.update(carPhotos).set({ isPrimary: true }).where(eq(carPhotos.id, photoId)).returning();
    },
};
