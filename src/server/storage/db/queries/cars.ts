import { and, asc, desc, eq, like } from "drizzle-orm"
import { db } from "./db"
import { carBodyTypes, carMakes, carModels, files, cars, carPhotos } from "../schema"

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

function generateSKUPrefix(year: number, makeName: string, modelName: string, bodyTypeName: string, color: string): string {
    const yearPrefix = String(year)
    const makePrefix = makeName.substring(0, 3).toUpperCase()
    const modelPrefix = modelName.substring(0, 3).toUpperCase()
    const bodyTypePrefix = bodyTypeName.substring(0, 3).toUpperCase()
    const colorPrefix = color.substring(0, 2).toUpperCase()
    return `${yearPrefix}${makePrefix}${modelPrefix}${bodyTypePrefix}${colorPrefix}`
}

async function getNextSKUNumber(prefix: string): Promise<number> {
    const pattern = `${prefix}%`
    const existingSKUs = await db
        .select({ sku: cars.sku })
        .from(cars)
        .where(like(cars.sku, pattern))
        .execute()
    
    let maxNumber = 0
    for (const { sku } of existingSKUs) {
        const numberPart = sku.substring(prefix.length)
        const number = parseInt(numberPart, 10)
        if (!isNaN(number) && number > maxNumber) {
            maxNumber = number
        }
    }
    
    return maxNumber + 1
}

async function generateSKU(year: number, makeName: string, modelName: string, bodyTypeName: string, color: string): Promise<string> {
    const prefix = generateSKUPrefix(year, makeName, modelName, bodyTypeName, color)
    const nextNumber = await getNextSKUNumber(prefix)
    const paddedNumber = String(nextNumber).padStart(4, '0')
    return `${prefix}${paddedNumber}`
}


async function getCarMakes() {
    return db.select().from(carMakes).innerJoin(files, eq(carMakes.logoId, files.id)).execute()
}

async function getCarMakeById(id: string) {
    const result = await db.select().from(carMakes).innerJoin(files, eq(carMakes.logoId, files.id)).where(eq(carMakes.id, id)).execute()
    return result[0] || null
}

async function createCarMake(data: { name: string; logoId: string }) {
    const [carMake] = await db.insert(carMakes).values({
        name: data.name,
        slug: slugify(data.name),
        logoId: data.logoId,
    }).returning()
    return carMake
}

async function updateCarMake(id: string, data: { name?: string; logoId?: string }) {
    const updateData: { name?: string; logoId?: string; slug?: string } = { ...data }
    if (data.name) {
        updateData.slug = slugify(data.name)
    }
    const [carMake] = await db.update(carMakes).set(updateData).where(eq(carMakes.id, id)).returning()
    return carMake
}

async function deleteCarMake(id: string) {
    const [carMake] = await db.delete(carMakes).where(eq(carMakes.id, id)).returning()
    return carMake
}

// Car Models functions
async function getCarModels() {
    return db.select().from(carModels).innerJoin(carMakes, eq(carModels.makeId, carMakes.id)).execute()
}

async function getCarModelById(id: string) {
    const result = await db.select().from(carModels).innerJoin(carMakes, eq(carModels.makeId, carMakes.id)).where(eq(carModels.id, id)).execute()
    return result[0] || null
}

async function createCarModel(data: { name: string; makeId: string }) {
    const [carModel] = await db.insert(carModels).values({
        name: data.name,
        slug: slugify(data.name),
        makeId: data.makeId,
    }).returning()
    return carModel
}

async function updateCarModel(id: string, data: { name?: string; makeId?: string }) {
    const updateData: { name?: string; makeId?: string; slug?: string } = { ...data }
    if (data.name) {
        updateData.slug = slugify(data.name)
    }
    const [carModel] = await db.update(carModels).set(updateData).where(eq(carModels.id, id)).returning()
    return carModel
}

async function deleteCarModel(id: string) {
    const [carModel] = await db.delete(carModels).where(eq(carModels.id, id)).returning()
    return carModel
}

// Car Body Types functions
async function getCarBodyTypes() {
    return db.select().from(carBodyTypes).innerJoin(files, eq(carBodyTypes.iconId, files.id)).execute()
}

async function getCarBodyTypeById(id: string) {
    const result = await db.select().from(carBodyTypes).innerJoin(files, eq(carBodyTypes.iconId, files.id)).where(eq(carBodyTypes.id, id)).execute()
    return result[0] || null
}

async function createCarBodyType(data: { name: string; iconId: string }) {
    const [carBodyType] = await db.insert(carBodyTypes).values({
        name: data.name,
        slug: slugify(data.name),
        iconId: data.iconId,
    }).returning()
    return carBodyType
}

async function updateCarBodyType(id: string, data: { name?: string; iconId?: string }) {
    const updateData: { name?: string; slug?: string; iconId?: string } = { ...data }
    if (data.name) {
        updateData.slug = slugify(data.name)
    }
    const [carBodyType] = await db.update(carBodyTypes).set(updateData).where(eq(carBodyTypes.id, id)).returning()
    return carBodyType
}

async function deleteCarBodyType(id: string) {
    const [carBodyType] = await db.delete(carBodyTypes).where(eq(carBodyTypes.id, id)).returning()
    return carBodyType
}

async function getModelsByMake() {
    const models = await db.select().from(carModels).innerJoin(carMakes, eq(carModels.makeId, carMakes.id)).execute()
    
    // Group models by make
    const modelsByMake: Record<string, any[]> = {}
    models.forEach((item) => {
        const makeId = item.car_makes.id
        const makeName = item.car_makes.name
        
        if (makeId && makeName) {
            if (!modelsByMake[makeId]) {
                modelsByMake[makeId] = []
            }
            modelsByMake[makeId].push({
                id: item.car_models.id,
                name: item.car_models.name,
                makeId: makeId,
                makeName: makeName,
            })
        }
    })
    
    return modelsByMake
}

// Car Inventory functions
async function getAllCars() {
    return db
        .select()
        .from(cars)
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .innerJoin(carMakes, eq(carModels.makeId, carMakes.id))
        .innerJoin(carBodyTypes, eq(cars.bodyTypeId, carBodyTypes.id))
        .leftJoin(
            carPhotos,
            and(eq(cars.id, carPhotos.carId), eq(carPhotos.isPrimary, true))
        )
        .leftJoin(files, eq(carPhotos.photoId, files.id))
        .execute()
}

async function getCarById(id: string) {
    const result = await db
        .select()
        .from(cars)
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .innerJoin(carMakes, eq(carModels.makeId, carMakes.id))
        .innerJoin(carBodyTypes, eq(cars.bodyTypeId, carBodyTypes.id))
        .leftJoin(carPhotos, eq(cars.id, carPhotos.carId))
        .leftJoin(files, eq(carPhotos.photoId, files.id))
        .where(eq(cars.id, id))
        .execute()
    return result[0] || null
}

async function getFeaturedCars() {
    return db
        .select()
        .from(cars)
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .innerJoin(carMakes, eq(carModels.makeId, carMakes.id))
        .innerJoin(carBodyTypes, eq(cars.bodyTypeId, carBodyTypes.id))
        .leftJoin(carPhotos, eq(cars.id, carPhotos.carId))
        .leftJoin(files, eq(carPhotos.photoId, files.id))
        .where(eq(cars.isFeatured, true))
        .execute()
}

async function getCarPhotos(carId: string) {
    return db
        .select()
        .from(carPhotos)
        .innerJoin(files, eq(carPhotos.photoId, files.id))
    .where(eq(carPhotos.carId, carId))
    .orderBy(desc(carPhotos.isPrimary), asc(carPhotos.createdAt), asc(carPhotos.id))
        .execute()
}

async function getPrimaryPhoto(carId: string) {
    const result = await db
        .select()
        .from(carPhotos)
        .innerJoin(files, eq(carPhotos.photoId, files.id))
        .where(eq(carPhotos.carId, carId))
        .execute()
    // Find the primary photo, or return the first one
    const primary = result.find(r => r.car_photos.isPrimary)
    return primary || result[0] || null
}

async function createCar(data: {
    year: number
    modelId: string
    makeName: string
    modelName: string
    bodyTypeId: string
    bodyTypeName: string
    price: string
    color: string
    transmission: string
    fuelType: string
    mileage: number
    condition: string
    photos?: Array<{ photoId: string; description?: string; isPrimary?: boolean }>
}) {
    const sku = await generateSKU(data.year, data.makeName, data.modelName, data.bodyTypeName, data.color)
    
    const [car] = await db
        .insert(cars)
        .values({
            year: data.year,
            modelId: data.modelId,
            price: data.price,
            bodyTypeId: data.bodyTypeId,
            mileage: data.mileage,
            condition: data.condition,
            color: data.color,
            transmission: data.transmission,
            fuelType: data.fuelType,
            sku: sku,
        })
        .returning()
    
    // Add photos if provided
    if (data.photos && data.photos.length > 0) {
        const photoValues = data.photos.map(p => ({
            carId: car.id,
            photoId: p.photoId,
            description: p.description,
            isPrimary: p.isPrimary || false,
        }))
        await db.insert(carPhotos).values(photoValues).execute()
    }
    
    return car
}

async function updateCar(id: string, data: Partial<{
    year: number
    modelId: string
    makeName?: string
    modelName?: string
    bodyTypeId: string
    bodyTypeName?: string
    price: string
    color: string
    transmission: string
    fuelType: string
    mileage: number
    condition: string
    isFeatured: boolean
    sold: boolean
}>) {
    const updateData: any = { ...data }
    
    // If color is being updated, we need year for SKU regeneration
    if (data.color && data.makeName && data.modelName && data.bodyTypeName) {
        // Get existing car to get year if not provided
        let yearToUse = data.year
        if (!yearToUse) {
            const [existing] = await db.select({ year: cars.year }).from(cars).where(eq(cars.id, id)).execute()
            yearToUse = existing.year
        }
        const sku = await generateSKU(yearToUse, data.makeName, data.modelName, data.bodyTypeName, data.color)
        updateData.sku = sku
    }
    
    // Remove extra fields used only for SKU generation
    delete updateData.makeName
    delete updateData.modelName
    delete updateData.bodyTypeName
    
    const [car] = await db
        .update(cars)
        .set(updateData)
        .where(eq(cars.id, id))
        .returning()
    return car
}

async function addCarPhoto(carId: string, photoId: string, description?: string, isPrimary?: boolean) {
    const [photo] = await db
        .insert(carPhotos)
        .values({
            carId,
            photoId,
            description,
            isPrimary: isPrimary || false,
        })
        .returning()
    return photo
}

async function updateCarPhoto(photoId: string, data: { description?: string; isPrimary?: boolean }) {
    const [photo] = await db
        .update(carPhotos)
        .set(data)
        .where(eq(carPhotos.id, photoId))
        .returning()
    return photo
}

async function deleteCarPhoto(photoId: string) {
    const [photo] = await db
        .delete(carPhotos)
        .where(eq(carPhotos.id, photoId))
        .returning()
    return photo
}

async function toggleCarListed(id: string) {
    const [car] = await db.select().from(cars).where(eq(cars.id, id)).execute()
    if (!car) return null
    
    const [updated] = await db
        .update(cars)
        .set({ listed: !car.listed })
        .where(eq(cars.id, id))
        .returning()
    return updated
}

async function toggleCarSold(id: string) {
    const [car] = await db.select().from(cars).where(eq(cars.id, id)).execute()
    if (!car) return null
    
    const [updated] = await db
        .update(cars)
        .set({ sold: !car.sold })
        .where(eq(cars.id, id))
        .returning()
    return updated
}

async function toggleCarFeatured(id: string) {
    const [car] = await db.select().from(cars).where(eq(cars.id, id)).execute()
    if (!car) return null
    
    const [updated] = await db
        .update(cars)
        .set({ isFeatured: !car.isFeatured })
        .where(eq(cars.id, id))
        .returning()
    return updated
}

async function deleteCar(id: string) {
    const [car] = await db
        .delete(cars)
        .where(eq(cars.id, id))
        .returning()
    return car
}

export const carStore = {
    getCarMakes,
    getCarMakeById,
    createCarMake,
    updateCarMake,
    deleteCarMake,
    getCarModels,
    getCarModelById,
    createCarModel,
    updateCarModel,
    deleteCarModel,
    getCarBodyTypes,
    getCarBodyTypeById,
    createCarBodyType,
    updateCarBodyType,
    deleteCarBodyType,
    getModelsByMake,
    getAllCars,
    getCarById,
    getFeaturedCars,
    getCarPhotos,
    getPrimaryPhoto,
    createCar,
    updateCar,
    addCarPhoto,
    updateCarPhoto,
    deleteCarPhoto,
    toggleCarListed,
    toggleCarSold,
    toggleCarFeatured,
    deleteCar,
    generateSKUPrefix,
    generateSKU,
}