/**
 * Format phone number to Ugandan format
 * Supports: 0775193044, 775193044, +256775193044, 07xx xxx xxx
 * Returns: +256 7xx xxx xxx or error message
 */
export function formatUgandanPhone(input: string): { formatted: string; error?: string } {
  // Remove all non-digit characters except +
  let cleaned = input.replace(/[^\d+]/g, '')

  // Remove leading + for processing
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1)
  }

  // If starts with 256 (country code), remove it
  if (cleaned.startsWith('256')) {
    cleaned = cleaned.slice(3)
  }

  // If starts with 0, remove it
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1)
  }

  // Check if it's a valid length (9 digits after removing country prefix/leading 0)
  if (cleaned.length !== 9) {
    return {
      formatted: input,
      error: 'Phone number must be 10 digits (e.g., 0775193044)',
    }
  }

  // Check if it starts with valid Uganda prefix (7 or 3)
  if (!cleaned.match(/^[73]\d{8}$/)) {
    return {
      formatted: input,
      error: 'Phone number must start with 07 or 03',
    }
  }

  // Format as +256 7xx xxx xxx
  const formatted = `+256 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`

  return { formatted }
}

/**
 * Validate Ugandan phone number
 */
export function isValidUgandanPhone(phone: string): boolean {
  const result = formatUgandanPhone(phone)
  return !result.error
}

/**
 * Get Ugandan phone without formatting (digits only, without country code)
 */
export function getPhoneDigits(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, '')
  
  // Remove country code if present
  if (cleaned.startsWith('256')) {
    return cleaned.slice(3)
  }
  
  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    return cleaned.slice(1)
  }
  
  return cleaned
}
