import { and, asc, desc, eq, like, or, sql, ilike, gte, lte, inArray, count } from "drizzle-orm"
import { db } from "./db"
import {
    carBodyTypes,
    carMakes,
    carModels,
    files,
    cars,
    carPhotos,
    carFeatureTypes,
    carHistoryChecklist,
    carFeatures,
    carHistory,
} from "../schema"

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

// Car Feature Types functions
async function getCarFeatureTypes() {
    return db.select().from(carFeatureTypes).orderBy(asc(carFeatureTypes.name)).execute()
}

async function getCarFeatureTypeById(id: string) {
    const result = await db.select().from(carFeatureTypes).where(eq(carFeatureTypes.id, id)).execute()
    return result[0] || null
}

async function createCarFeatureType(data: { name: string; icon: string }) {
    const [feature] = await db.insert(carFeatureTypes).values({
        name: data.name,
        slug: slugify(data.name),
        icon: data.icon,
    }).returning()
    return feature
}

async function updateCarFeatureType(id: string, data: { name?: string; icon?: string }) {
    const updateData: { name?: string; icon?: string; slug?: string } = { ...data }
    if (data.name) {
        updateData.slug = slugify(data.name)
    }
    const [feature] = await db.update(carFeatureTypes).set(updateData).where(eq(carFeatureTypes.id, id)).returning()
    return feature
}

async function deleteCarFeatureType(id: string) {
    const [feature] = await db.delete(carFeatureTypes).where(eq(carFeatureTypes.id, id)).returning()
    return feature
}

// Car History Checklist functions
async function getCarHistoryChecklist() {
    return db.select().from(carHistoryChecklist).orderBy(asc(carHistoryChecklist.displayIndex), asc(carHistoryChecklist.description)).execute()
}

async function getNextHistoryChecklistDisplayIndex() {
    const rows = await db
        .select({ displayIndex: carHistoryChecklist.displayIndex })
        .from(carHistoryChecklist)
        .orderBy(desc(carHistoryChecklist.displayIndex))
        .limit(1)
        .execute()

    const currentMax = rows[0]?.displayIndex ?? 0
    return currentMax + 1
}

async function getCarHistoryChecklistById(id: string) {
    const result = await db.select().from(carHistoryChecklist).where(eq(carHistoryChecklist.id, id)).execute()
    return result[0] || null
}

async function createCarHistoryChecklist(data: { description: string; iconSvg: string; displayIndex: number }) {
    const [item] = await db.insert(carHistoryChecklist).values({
        description: data.description,
        iconSvg: data.iconSvg,
        displayIndex: data.displayIndex,
    }).returning()
    return item
}

async function updateCarHistoryChecklist(id: string, data: { description?: string; iconSvg?: string; displayIndex?: number }) {
    const [item] = await db.update(carHistoryChecklist).set(data).where(eq(carHistoryChecklist.id, id)).returning()
    return item
}

async function deleteCarHistoryChecklist(id: string) {
    const [item] = await db.delete(carHistoryChecklist).where(eq(carHistoryChecklist.id, id)).returning()
    return item
}

async function getCarFeatureIdsByCar(carId: string) {
    const rows = await db.select({ featureTypeId: carFeatures.featureTypeId }).from(carFeatures).where(eq(carFeatures.carId, carId)).execute()
    return rows.map((row) => row.featureTypeId)
}

async function getCarHistoryIdsByCar(carId: string) {
    const rows = await db.select({ checklistId: carHistory.checklistId }).from(carHistory).where(eq(carHistory.carId, carId)).execute()
    return rows.map((row) => row.checklistId)
}

async function setCarFeatures(carId: string, featureIds: string[]) {
    await db.delete(carFeatures).where(eq(carFeatures.carId, carId)).execute()
    if (!featureIds.length) return
    const values = featureIds.map((featureTypeId) => ({ carId, featureTypeId }))
    await db.insert(carFeatures).values(values).execute()
}

async function setCarHistoryChecklist(carId: string, checklistIds: string[]) {
    await db.delete(carHistory).where(eq(carHistory.carId, carId)).execute()
    if (!checklistIds.length) return
    const values = checklistIds.map((checklistId) => ({ carId, checklistId }))
    await db.insert(carHistory).values(values).execute()
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

async function getCarsInventoryList() {
    return db
        .select({
            id: cars.id,
            sku: cars.sku,
            year: cars.year,
            price: cars.price,
            color: cars.color,
            listed: cars.listed,
            sold: cars.sold,
            isFeatured: cars.isFeatured,
            primaryImage: files.media_url,
        })
        .from(cars)
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

// Public car listings with filters and pagination
type PublicCarListingFilters = {
    search?: string
    makeIds?: string[]
    modelIds?: string[]
    bodyTypeIds?: string[]
    years?: number[]
    minPrice?: number
    maxPrice?: number
    transmissions?: string[]
    fuelTypes?: string[]
    conditions?: string[]
    colors?: string[]
    minMileage?: number
    maxMileage?: number
    page?: number
    limit?: number
    sortBy?: 'price_asc' | 'price_desc' | 'year_asc' | 'year_desc' | 'mileage_asc' | 'mileage_desc' | 'featured'
}

async function getPublicCarListings(filters: PublicCarListingFilters = {}) {
    const {
        search,
        makeIds,
        modelIds,
        bodyTypeIds,
        years,
        minPrice,
        maxPrice,
        transmissions,
        fuelTypes,
        conditions,
        colors,
        minMileage,
        maxMileage,
        page = 1,
        limit = 12,
        sortBy = 'featured'
    } = filters

    // Build where conditions
    const conditions_list: any[] = [
        eq(cars.listed, true),
        eq(cars.sold, false)
    ]

    // Search in make, model, year, body type (prefix match)
    if (search && search.trim()) {
        const searchTerm = `${search.trim()}%`
        conditions_list.push(
            or(
                ilike(carMakes.name, searchTerm),
                ilike(carModels.name, searchTerm),
                ilike(carBodyTypes.name, searchTerm),
                sql`CAST(${cars.year} AS TEXT) ILIKE ${searchTerm}`
            )
        )
    }

    if (makeIds && makeIds.length > 0) {
        conditions_list.push(inArray(carMakes.id, makeIds))
    }

    if (modelIds && modelIds.length > 0) {
        conditions_list.push(inArray(cars.modelId, modelIds))
    }

    if (bodyTypeIds && bodyTypeIds.length > 0) {
        conditions_list.push(inArray(cars.bodyTypeId, bodyTypeIds))
    }

    if (years && years.length > 0) {
        conditions_list.push(inArray(cars.year, years))
    }

    if (minPrice !== undefined) {
        conditions_list.push(gte(cars.price, minPrice.toString()))
    }

    if (maxPrice !== undefined) {
        conditions_list.push(lte(cars.price, maxPrice.toString()))
    }

    if (transmissions && transmissions.length > 0) {
        conditions_list.push(inArray(cars.transmission, transmissions))
    }

    if (fuelTypes && fuelTypes.length > 0) {
        conditions_list.push(inArray(cars.fuelType, fuelTypes))
    }

    if (conditions && conditions.length > 0) {
        conditions_list.push(inArray(cars.condition, conditions))
    }

    if (colors && colors.length > 0) {
        conditions_list.push(inArray(cars.color, colors))
    }

    if (minMileage !== undefined) {
        conditions_list.push(gte(cars.mileage, minMileage))
    }

    if (maxMileage !== undefined) {
        conditions_list.push(lte(cars.mileage, maxMileage))
    }

    const whereClause = and(...conditions_list)

    // Get total count
    const [{ total }] = await db
        .select({ total: count() })
        .from(cars)
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .innerJoin(carMakes, eq(carModels.makeId, carMakes.id))
        .innerJoin(carBodyTypes, eq(cars.bodyTypeId, carBodyTypes.id))
        .where(whereClause)
        .execute()

    // Determine sort order
    const orderByClause = [] as Array<ReturnType<typeof asc> | ReturnType<typeof desc>>
    switch (sortBy) {
        case 'price_asc':
            orderByClause.push(asc(cars.price))
            break
        case 'price_desc':
            orderByClause.push(desc(cars.price))
            break
        case 'year_asc':
            orderByClause.push(asc(cars.year))
            break
        case 'year_desc':
            orderByClause.push(desc(cars.year))
            break
        case 'mileage_asc':
            orderByClause.push(asc(cars.mileage))
            break
        case 'mileage_desc':
            orderByClause.push(desc(cars.mileage))
            break
        case 'featured':
            orderByClause.push(asc(cars.isFeatured), desc(cars.createdAt))
            break
        default:
            orderByClause.push(desc(cars.createdAt))
            break
    }

    // Get paginated results
    const offset = (page - 1) * limit
    const results = await db
        .select({
            id: cars.id,
            sku: cars.sku,
            year: cars.year,
            price: cars.price,
            color: cars.color,
            transmission: cars.transmission,
            fuelType: cars.fuelType,
            mileage: cars.mileage,
            condition: cars.condition,
            isFeatured: cars.isFeatured,
            listed: cars.listed,
            sold: cars.sold,
            createdAt: cars.createdAt,
            make: {
                id: carMakes.id,
                name: carMakes.name,
                slug: carMakes.slug,
            },
            model: {
                id: carModels.id,
                name: carModels.name,
                slug: carModels.slug,
            },
            bodyType: {
                id: carBodyTypes.id,
                name: carBodyTypes.name,
                slug: carBodyTypes.slug,
            },
            primaryImage: files.media_url,
        })
        .from(cars)
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .innerJoin(carMakes, eq(carModels.makeId, carMakes.id))
        .innerJoin(carBodyTypes, eq(cars.bodyTypeId, carBodyTypes.id))
        .leftJoin(
            carPhotos,
            and(eq(cars.id, carPhotos.carId), eq(carPhotos.isPrimary, true))
        )
        .leftJoin(files, eq(carPhotos.photoId, files.id))
        .where(whereClause)
        .orderBy(...orderByClause)
        .limit(limit)
        .offset(offset)
        .execute()

    const carIds = results.map((car) => car.id)
    const featureRows = carIds.length
        ? await db
            .select({
                carId: carFeatures.carId,
                features: sql<string[]>`array_agg(${carFeatureTypes.name} ORDER BY ${carFeatureTypes.name})`,
            })
            .from(carFeatures)
            .innerJoin(carFeatureTypes, eq(carFeatures.featureTypeId, carFeatureTypes.id))
            .where(inArray(carFeatures.carId, carIds))
            .groupBy(carFeatures.carId)
            .execute()
        : []

    const featuresByCarId = new Map(
        featureRows.map((row) => [row.carId, row.features || []])
    )

    return {
        data: results.map((car) => ({
            ...car,
            features: featuresByCarId.get(car.id) || [],
        })),
        pagination: {
            page,
            limit,
            total: Number(total),
            totalPages: Math.ceil(Number(total) / limit),
        }
    }
}

// Get car details with features and history
async function getPublicCarDetails(carId: string) {
    const carData = await db
        .select()
        .from(cars)
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .innerJoin(carMakes, eq(carModels.makeId, carMakes.id))
        .innerJoin(carBodyTypes, eq(cars.bodyTypeId, carBodyTypes.id))
        .where(and(eq(cars.id, carId), eq(cars.listed, true), eq(cars.sold, false)))
        .execute()

    if (!carData.length) return null

    // Get all photos
    const photos = await db
        .select({
            id: carPhotos.id,
            description: carPhotos.description,
            isPrimary: carPhotos.isPrimary,
            url: files.media_url,
            publicId: files.public_id,
        })
        .from(carPhotos)
        .innerJoin(files, eq(carPhotos.photoId, files.id))
        .where(eq(carPhotos.carId, carId))
        .orderBy(desc(carPhotos.isPrimary), asc(carPhotos.createdAt))
        .execute()

    // Get features
    const features = await db
        .select({
            id: carFeatureTypes.id,
            name: carFeatureTypes.name,
            icon: carFeatureTypes.icon,
        })
        .from(carFeatures)
        .innerJoin(carFeatureTypes, eq(carFeatures.featureTypeId, carFeatureTypes.id))
        .where(eq(carFeatures.carId, carId))
        .execute()

    // Get history checklist
    const history = await db
        .select({
            id: carHistoryChecklist.id,
            description: carHistoryChecklist.description,
            iconSvg: carHistoryChecklist.iconSvg,
        })
        .from(carHistory)
        .innerJoin(carHistoryChecklist, eq(carHistory.checklistId, carHistoryChecklist.id))
        .where(eq(carHistory.carId, carId))
        .orderBy(asc(carHistoryChecklist.displayIndex))
        .execute()

    return {
        ...carData[0],
        photos,
        features,
        history,
    }
}

// Get filter options for faceted search
async function getCarFilterOptions() {
    // Get all makes with car count
    const makes = await db
        .select({
            id: carMakes.id,
            name: carMakes.name,
            count: count(cars.id),
        })
        .from(carMakes)
        .innerJoin(carModels, eq(carMakes.id, carModels.makeId))
        .innerJoin(cars, eq(carModels.id, cars.modelId))
        .where(and(eq(cars.listed, true), eq(cars.sold, false)))
        .groupBy(carMakes.id, carMakes.name)
        .orderBy(asc(carMakes.name))
        .execute()

    // Get all body types with car count
    const bodyTypes = await db
        .select({
            id: carBodyTypes.id,
            name: carBodyTypes.name,
            iconUrl: files.media_url,
            count: count(cars.id),
        })
        .from(carBodyTypes)
        .leftJoin(files, eq(carBodyTypes.iconId, files.id))
        .innerJoin(cars, eq(carBodyTypes.id, cars.bodyTypeId))
        .where(and(eq(cars.listed, true), eq(cars.sold, false)))
        .groupBy(carBodyTypes.id, carBodyTypes.name, files.media_url)
        .orderBy(asc(carBodyTypes.name))
        .execute()

    // Get unique values for other filters
    const uniqueValues = await db
        .select({
            years: sql<number[]>`array_agg(DISTINCT ${cars.year} ORDER BY ${cars.year} DESC)`,
            transmissions: sql<string[]>`array_agg(DISTINCT ${cars.transmission} ORDER BY ${cars.transmission})`,
            fuelTypes: sql<string[]>`array_agg(DISTINCT ${cars.fuelType} ORDER BY ${cars.fuelType})`,
            conditions: sql<string[]>`array_agg(DISTINCT ${cars.condition} ORDER BY ${cars.condition})`,
            colors: sql<string[]>`array_agg(DISTINCT ${cars.color} ORDER BY ${cars.color})`,
            minPrice: sql<string>`MIN(${cars.price})`,
            maxPrice: sql<string>`MAX(${cars.price})`,
            minMileage: sql<number>`MIN(${cars.mileage})`,
            maxMileage: sql<number>`MAX(${cars.mileage})`,
        })
        .from(cars)
        .where(and(eq(cars.listed, true), eq(cars.sold, false)))
        .execute()

    return {
        makes,
        bodyTypes,
        years: uniqueValues[0]?.years || [],
        transmissions: uniqueValues[0]?.transmissions || [],
        fuelTypes: uniqueValues[0]?.fuelTypes || [],
        conditions: uniqueValues[0]?.conditions || [],
        colors: uniqueValues[0]?.colors || [],
        priceRange: {
            min: parseFloat(uniqueValues[0]?.minPrice || '0'),
            max: parseFloat(uniqueValues[0]?.maxPrice || '0'),
        },
        mileageRange: {
            min: uniqueValues[0]?.minMileage || 0,
            max: uniqueValues[0]?.maxMileage || 0,
        },
    }
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
    featureIds?: string[]
    historyChecklistIds?: string[]
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

    if (data.featureIds) {
        await setCarFeatures(car.id, data.featureIds)
    }

    if (data.historyChecklistIds) {
        await setCarHistoryChecklist(car.id, data.historyChecklistIds)
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
    featureIds: string[]
    historyChecklistIds: string[]
}>) {
    const { featureIds, historyChecklistIds, ...baseUpdate } = data
    const updateData: any = { ...baseUpdate }
    
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

    if (featureIds) {
        await setCarFeatures(id, featureIds)
    }

    if (historyChecklistIds) {
        await setCarHistoryChecklist(id, historyChecklistIds)
    }
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
    getCarFeatureTypes,
    getCarFeatureTypeById,
    createCarFeatureType,
    updateCarFeatureType,
    deleteCarFeatureType,
    getCarHistoryChecklist,
    getNextHistoryChecklistDisplayIndex,
    getCarHistoryChecklistById,
    createCarHistoryChecklist,
    updateCarHistoryChecklist,
    deleteCarHistoryChecklist,
    getCarFeatureIdsByCar,
    getCarHistoryIdsByCar,
    setCarFeatures,
    setCarHistoryChecklist,
    getModelsByMake,
    getAllCars,
    getCarsInventoryList,
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
    getPublicCarListings,
    getPublicCarDetails,
    getCarFilterOptions,
}