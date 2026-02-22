import { eq } from "drizzle-orm"
import { db } from "./db"
import { carBodyTypes, carMakes, carModels, files, cars } from "../schema"

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
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
        .innerJoin(carMakes, eq(cars.makeId, carMakes.id))
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .leftJoin(files, eq(cars.photoId, files.id))
        .execute()
}

async function getCarById(id: string) {
    const result = await db
        .select()
        .from(cars)
        .innerJoin(carMakes, eq(cars.makeId, carMakes.id))
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .leftJoin(files, eq(cars.photoId, files.id))
        .where(eq(cars.id, id))
        .execute()
    return result[0] || null
}

async function getFeaturedCars() {
    return db
        .select()
        .from(cars)
        .innerJoin(carMakes, eq(cars.makeId, carMakes.id))
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .leftJoin(files, eq(cars.photoId, files.id))
        .where(eq(cars.isFeatured, true))
        .execute()
}

async function createCar(data: {
    year: number
    makeId: string
    modelId: string
    price: string
    bodyType: string
    mileage: number
    condition: string
    isFeatured?: boolean
    rating?: number
    photoId?: string
}) {
    const [car] = await db
        .insert(cars)
        .values({
            year: data.year,
            makeId: data.makeId,
            modelId: data.modelId,
            price: data.price,
            bodyType: data.bodyType,
            mileage: data.mileage,
            condition: data.condition,
            isFeatured: data.isFeatured || false,
            rating: data.rating?.toString() || "0",
            photoId: data.photoId,
        })
        .returning()
    return car
}

async function updateCar(id: string, data: Partial<{
    year: number
    makeId: string
    modelId: string
    price: string
    bodyType: string
    mileage: number
    condition: string
    isFeatured: boolean
    rating: number
    photoId: string
}>) {
    const updateData: any = { ...data }
    if (data.rating !== undefined) {
        updateData.rating = data.rating.toString()
    }
    const [car] = await db
        .update(cars)
        .set(updateData)
        .where(eq(cars.id, id))
        .returning()
    return car
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
    createCar,
    updateCar,
    deleteCar,
}