import { db } from "./db";
import { settings } from "../schema";
import { eq } from "drizzle-orm";

const SITE_SETTINGS_TYPE = "site_settings";

type BusinessHour = {
    days: string;
    time: string;
};

type ContactDetail = {
    title: string;
    value: string;
};

type SiteSettingsValue = {
    companyName?: string;
    companyDescription?: string;
    address?: string;
    phoneNumber?: string;
    additionalPhoneNumbers?: ContactDetail[];
    emailAddress?: string;
    additionalEmailAddresses?: ContactDetail[];
    businessHours?: BusinessHour[];
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    siteTitle?: string;
    metaDescription?: string;
    seoKeywords?: string[];
};

async function getSiteSettingsRow() {
    const existing = await db.query.settings.findFirst({
        where: (table, { eq }) => eq(table.type, SITE_SETTINGS_TYPE),
    });

    if (existing) {
        return existing;
    }

    const [created] = await db.insert(settings).values({
        type: SITE_SETTINGS_TYPE,
        value: {},
    }).returning();

    return created;
}

async function updateSettingsValue(partial: Partial<SiteSettingsValue>) {
    const row = await getSiteSettingsRow();
    const currentValue = (row.value ?? {}) as SiteSettingsValue;
    const nextValue: SiteSettingsValue = {
        ...currentValue,
        ...partial,
    };

    await db
        .update(settings)
        .set({
            value: nextValue,
            updatedAt: new Date(),
        })
        .where(eq(settings.id, row.id));

    return nextValue;
}

async function getSettings() {
    const row = await getSiteSettingsRow();
    return (row.value ?? {}) as SiteSettingsValue;
}

function sanitizeString(value?: string) {
    return value?.trim() || undefined;
}

function sanitizeContactDetails(values?: unknown[]) {
    if (!Array.isArray(values)) {
        return [];
    }

    const normalized = values.flatMap((item) => {
        if (typeof item === "string") {
            const value = item.trim();
            return value ? [{ title: "", value }] : [];
        }

        if (item && typeof item === "object") {
            const title = "title" in item && typeof item.title === "string"
                ? item.title.trim()
                : "";
            const value = "value" in item && typeof item.value === "string"
                ? item.value.trim()
                : "";

            return value ? [{ title, value }] : [];
        }

        return [];
    });

    return normalized.filter((item, index, array) => (
        array.findIndex((candidate) => (
            candidate.title === item.title && candidate.value === item.value
        )) === index
    ));
}

async function updateCompanyInformation(data: {
    companyName?: string;
    companyDescription?: string;
}) {
    return updateSettingsValue({
        companyName: data.companyName,
        companyDescription: data.companyDescription,
    });
}

async function updateLocationAndContact(data: {
    address?: string;
    phoneNumber?: string;
    additionalPhoneNumbers?: ContactDetail[];
    emailAddress?: string;
    additionalEmailAddresses?: ContactDetail[];
    businessHours?: BusinessHour[];
}) {
    return updateSettingsValue({
        address: data.address,
        phoneNumber: sanitizeString(data.phoneNumber),
        additionalPhoneNumbers: sanitizeContactDetails(data.additionalPhoneNumbers),
        emailAddress: sanitizeString(data.emailAddress),
        additionalEmailAddresses: sanitizeContactDetails(data.additionalEmailAddresses),
        businessHours: data.businessHours,
    });
}

async function updateSocialMedia(data: {
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
}) {
    return updateSettingsValue({
        facebookUrl: data.facebookUrl,
        twitterUrl: data.twitterUrl,
        instagramUrl: data.instagramUrl,
        linkedinUrl: data.linkedinUrl,
    });
}

async function updateSeoSettings(data: {
    siteTitle?: string;
    metaDescription?: string;
    seoKeywords?: string[];
}) {
    return updateSettingsValue({
        siteTitle: data.siteTitle,
        metaDescription: data.metaDescription,
        seoKeywords: data.seoKeywords,
    });
}

export const settingsStore = {
    getSettings,
    updateCompanyInformation,
    updateLocationAndContact,
    updateSocialMedia,
    updateSeoSettings,
};
