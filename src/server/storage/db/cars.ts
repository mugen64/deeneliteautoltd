import { eq } from "drizzle-orm"
import { db } from "./db"
import { carMakes, carModels, files, cars } from "./schema"


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
        logoId: data.logoId,
    }).returning()
    return carMake
}

async function updateCarMake(id: string, data: { name?: string; logoId?: string }) {
    const [carMake] = await db.update(carMakes).set(data).where(eq(carMakes.id, id)).returning()
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
        makeId: data.makeId,
    }).returning()
    return carModel
}

async function updateCarModel(id: string, data: { name?: string; makeId?: string }) {
    const [carModel] = await db.update(carModels).set(data).where(eq(carModels.id, id)).returning()
    return carModel
}

async function deleteCarModel(id: string) {
    const [carModel] = await db.delete(carModels).where(eq(carModels.id, id)).returning()
    return carModel
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
    getModelsByMake,
    getAllCars,
    getCarById,
    getFeaturedCars,
    createCar,
    updateCar,
    deleteCar,
}