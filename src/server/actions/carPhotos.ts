import '@/server/storage/files/cloudinary'
import { v2 as cloudinary } from 'cloudinary'
import { carPhotoStore } from '@/server/storage/db/queries/carPhotos'
import { db } from '@/server/storage/db/queries/db'
import { files } from '@/server/storage/db/schema'
import { eq } from 'drizzle-orm'

export async function deleteCarPhoto(photoId: string) {
  try {
    // Get the car photo record
    const carPhoto = await carPhotoStore.getCarPhotoById(photoId);
    if (!carPhoto) {
      throw new Error("Photo not found");
    }

    // Delete from cloudinary using public_id
    // First, get the file record to get the public_id
    const fileRecords = await db
      .select()
      .from(files)
      .where(eq(files.id, carPhoto.photoId))
      .limit(1)
      .then((result) => result[0] || null)

    if (fileRecords?.public_id) {
      await cloudinary.uploader.destroy(fileRecords.public_id);
    }

    // Delete the car photo record
    await carPhotoStore.deleteCarPhoto(photoId);

    return { success: true };
  } catch (error) {
    throw new Error(
      `Failed to delete photo: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
