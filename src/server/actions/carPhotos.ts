import '@/server/storage/files/cloudinary'
import { v2 as cloudinary } from 'cloudinary'
import { carPhotoStore } from '@/server/storage/db/queries/carPhotos'
import { fileStore } from '@/server/storage/db/queries/files'
import { db } from '@/server/storage/db/queries/db'
import { files } from '@/server/storage/db/schema'
import { eq } from 'drizzle-orm'
import { Readable } from 'stream'

export async function uploadCarPhoto({
  carId,
  file,
  filename,
}: {
  carId: string;
  file: Buffer;
  filename: string;
}) {
  try {
    // Convert buffer to stream for cloudinary
    const stream = Readable.from([file]);

    // Upload to cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "deenelite/cars",
          public_id: `${carId}-${Date.now()}-${filename}`,
        },
        async (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
            return;
          }

          try {
            // Save file reference to database
            const fileRecord = await fileStore.saveFile({
              userId: carId, // Using carId as a reference
              public_id: result!.public_id,
              media_url: result!.secure_url,
              resource_type: result!.resource_type,
              description: filename,
            });

            // Create car photo record
            const carPhoto = await carPhotoStore.createCarPhoto({
              carId,
              photoId: fileRecord.id,
              description: filename,
            });

            resolve({
              id: carPhoto.id,
              carId: carPhoto.carId,
              photoId: carPhoto.photoId,
              url: fileRecord.media_url,
              createdAt: carPhoto.createdAt,
            });
          } catch (dbError) {
            reject(
              new Error(
                `Database operation failed: ${
                  dbError instanceof Error ? dbError.message : "Unknown error"
                }`
              )
            );
          }
        }
      );

      stream.pipe(uploadStream);
    });
  } catch (error) {
    throw new Error(
      `Failed to upload photo: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

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

export async function setPrimaryPhoto(carId: string, photoId: string) {
  try {
    const result = await carPhotoStore.setPrimaryPhoto(carId, photoId);
    return result[0];
  } catch (error) {
    throw new Error(
      `Failed to set primary photo: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
