
import { uploadCarPhoto } from '@/server/actions/carPhotos'

import { useAppSession } from '@/server/session'
export async function POST({ request }: { request: Request }) {
    const session = await useAppSession()
    if (!session.data.userId) {
        return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const carId = formData.get('carId') as string

        if (!file) {
            return Response.json({ error: 'No file provided' }, { status: 400 })
        }

        if (!carId) {
            return Response.json({ error: 'No car ID provided' }, { status: 400 })
        }

        if (!file.type.startsWith('image/')) {
            return Response.json({ error: 'File must be an image' }, { status: 400 })
        }

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Upload to storage
        const photo = await uploadCarPhoto({
            carId,
            file: buffer,
            filename: file.name,
        })

        return Response.json(photo)
    } catch (error: any) {
        console.error('Photo upload error:', error)
        return Response.json(
            { error: error?.message || 'Failed to upload photo' },
            { status: 500 }
        )
    }
}

