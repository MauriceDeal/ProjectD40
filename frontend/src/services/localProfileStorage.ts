import type { Partner360Profile } from '../types/partner'

const profilesKey = 'deal-collega.partner-profiles.v1'

function isProfile(value: unknown): value is Partner360Profile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Record<string, unknown>
  return typeof profile.id === 'string'
    && typeof profile.name === 'string'
    && Array.isArray(profile.contacts)
    && Array.isArray(profile.activities)
    && Array.isArray(profile.openActions)
    && Array.isArray(profile.documents)
    && Array.isArray(profile.internalNotes)
    && Array.isArray(profile.microsoft365Information)
}

export function getSavedProfiles(): Partner360Profile[] {
  const stored = localStorage.getItem(profilesKey)
  if (!stored) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(stored)
  } catch {
    throw new Error('De lokaal opgeslagen gegevens zijn beschadigd en kunnen niet worden geladen.')
  }

  if (!Array.isArray(parsed) || !parsed.every(isProfile)) {
    throw new Error('De lokaal opgeslagen partnergegevens hebben een ongeldig formaat.')
  }
  return parsed
}

export function saveProfile(profile: Partner360Profile): void {
  const profiles = getSavedProfiles()
  const updated = profiles.some((item) => item.id === profile.id)
    ? profiles.map((item) => item.id === profile.id ? profile : item)
    : [...profiles, profile]
  saveProfiles(updated)
}

export function saveProfiles(profiles: Partner360Profile[]): void {
  try {
    localStorage.setItem(profilesKey, JSON.stringify(profiles))
  } catch {
    throw new Error('Opslaan in deze browser is niet gelukt. Controleer de beschikbare opslagruimte en probeer opnieuw.')
  }
}
