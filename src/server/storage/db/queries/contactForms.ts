import { and, count, desc, eq } from 'drizzle-orm'
import { db } from './db'
import { contactForms, contactFormVehicles, cars, carModels, carMakes } from '../schema'

export type ContactFormStatus = 'incoming' | 'read' | 'responded' | 'closed'
export type ContactFormType = 'contact-form' | 'sell-car'

export type ContactFormInput = {
  type?: ContactFormType
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
const validTypes: ContactFormType[] = ['contact-form', 'sell-car']

function isValidStatus(status: string): status is ContactFormStatus {
  return validStatuses.includes(status as ContactFormStatus)
}

function isValidType(type: string): type is ContactFormType {
  return validTypes.includes(type as ContactFormType)
}

async function createContactForm(input: ContactFormInput) {
  const [created] = await db
    .insert(contactForms)
    .values({
      type: input.type || 'contact-form',
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

async function getContactForms(status?: ContactFormStatus, type?: ContactFormType) {
  const conditions = [
    ...(status ? [eq(contactForms.status, status)] : []),
    ...(type ? [eq(contactForms.type, type)] : []),
  ]

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

async function getContactFormStats(type?: ContactFormType) {
  const incomingConditions = [
    eq(contactForms.status, 'incoming' as ContactFormStatus),
    ...(type ? [eq(contactForms.type, type)] : []),
  ]
  const [incoming] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(and(...incomingConditions))
    .execute()

  const readConditions = [
    eq(contactForms.status, 'read' as ContactFormStatus),
    ...(type ? [eq(contactForms.type, type)] : []),
  ]
  const [read] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(and(...readConditions))
    .execute()

  const respondedConditions = [
    eq(contactForms.status, 'responded' as ContactFormStatus),
    ...(type ? [eq(contactForms.type, type)] : []),
  ]
  const [responded] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(and(...respondedConditions))
    .execute()

  const closedConditions = [
    eq(contactForms.status, 'closed' as ContactFormStatus),
    ...(type ? [eq(contactForms.type, type)] : []),
  ]
  const [closed] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(and(...closedConditions))
    .execute()

  const totalConditions = type ? [eq(contactForms.type, type)] : []
  const [total] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(totalConditions.length ? and(...totalConditions) : undefined)
    .execute()

  const contactFormConditions = [
    eq(contactForms.type, 'contact-form' as ContactFormType),
    ...(type ? [eq(contactForms.type, type)] : []),
  ]
  const [contactForm] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(and(...contactFormConditions))
    .execute()

  const sellCarConditions = [
    eq(contactForms.type, 'sell-car' as ContactFormType),
    ...(type ? [eq(contactForms.type, type)] : []),
  ]
  const [sellCar] = await db
    .select({ count: count() })
    .from(contactForms)
    .where(and(...sellCarConditions))
    .execute()

  return {
    incoming: incoming.count,
    read: read.count,
    responded: responded.count,
    closed: closed.count,
    total: total.count,
    contactForm: contactForm.count,
    sellCar: sellCar.count,
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
  isValidType,
}
