import { and, count, desc, eq, inArray } from 'drizzle-orm'
import { db } from './db'
import { contactForms, contactFormVehicles, cars, carModels, carMakes } from '../schema'

export type ContactFormStatus = 'incoming' | 'read' | 'responded' | 'closed'

export type ContactFormInput = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  interestedInVehicles: boolean
  selectedCars: string[]
}

export type ContactFormWithVehicles = Awaited<ReturnType<typeof getContactForms>>[0]

const validStatuses: ContactFormStatus[] = ['incoming', 'read', 'responded', 'closed']

function isValidStatus(status: string): status is ContactFormStatus {
  return validStatuses.includes(status as ContactFormStatus)
}

async function createContactForm(input: ContactFormInput) {
  const [created] = await db
    .insert(contactForms)
    .values({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || null,
      subject: input.subject,
      message: input.message,
      interestedInVehicles: input.interestedInVehicles,
      status: 'incoming',
    })
    .returning()

  // Insert selected vehicles if any
  if (input.selectedCars.length > 0) {
    await db
      .insert(contactFormVehicles)
      .values(
        input.selectedCars.map((carId) => ({
          contactFormId: created.id,
          carId,
        }))
      )
      .execute()
  }

  return created
}

async function getContactForms(status?: ContactFormStatus) {
  const conditions = status ? [eq(contactForms.status, status)] : []

  const forms = await db
    .select()
    .from(contactForms)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(contactForms.createdAt))
    .execute()

  // Fetch vehicles for each form with car details
  const formsWithVehicles = await Promise.all(
    forms.map(async (form) => {
      const vehicles = await db
        .select({
          id: cars.id,
          year: cars.year,
          price: cars.price,
          mileage: cars.mileage,
          condition: cars.condition,
          color: cars.color,
          transmission: cars.transmission,
          fuelType: cars.fuelType,
          make: carMakes.name,
          model: carModels.name,
        })
        .from(contactFormVehicles)
        .innerJoin(cars, eq(contactFormVehicles.carId, cars.id))
        .innerJoin(carModels, eq(cars.modelId, carModels.id))
        .innerJoin(carMakes, eq(carModels.makeId, carMakes.id))
        .where(eq(contactFormVehicles.contactFormId, form.id))
        .execute()

      return {
        ...form,
        vehicles,
      }
    })
  )

  return formsWithVehicles
}

async function getContactFormStats() {
  const [incoming] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(eq(contactForms.status, 'incoming'))
    .execute()

  const [read] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(eq(contactForms.status, 'read'))
    .execute()

  const [responded] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(eq(contactForms.status, 'responded'))
    .execute()

  const [closed] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(eq(contactForms.status, 'closed'))
    .execute()

  const [total] = await db
    .select({ count: count() })
    .from(contactForms)
    .execute()

  return {
    incoming: incoming.count,
    read: read.count,
    responded: responded.count,
    closed: closed.count,
    total: total.count,
  }
}

async function updateContactFormStatus(id: string, status: ContactFormStatus) {
  const updateData: {
    status: ContactFormStatus
    updatedAt: Date
    readAt?: Date
    respondedAt?: Date
    closedAt?: Date
  } = {
    status,
    updatedAt: new Date(),
  }

  if (status === 'read') {
    updateData.readAt = new Date()
  }

  if (status === 'responded') {
    updateData.respondedAt = new Date()
  }

  if (status === 'closed') {
    updateData.closedAt = new Date()
  }

  const [updated] = await db
    .update(contactForms)
    .set(updateData)
    .where(eq(contactForms.id, id))
    .returning()

  return updated
}

export const contactFormsStore = {
  createContactForm,
  getContactForms,
  getContactFormStats,
  updateContactFormStatus,
  isValidStatus,
}
