import { collectPartnerKnowledge } from '../data/partnerKnowledge'
import { getPartner360Profile } from './partner360Service'
import type { PartnerKnowledge } from '../types/partnerKnowledge'

export async function getDealCollegaContext(partnerId: string): Promise<PartnerKnowledge> {
  const profile = await getPartner360Profile(partnerId)
  if (!profile) throw new Error('De geselecteerde partner is niet gevonden.')
  return collectPartnerKnowledge(profile)
}