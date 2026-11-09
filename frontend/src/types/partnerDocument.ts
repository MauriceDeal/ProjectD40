export interface PartnerDocument {
  id: string
  partnerId: string
  name: string
  kind: string
  updatedAt: string
  summary: string
  storageId?: string
  mimeType?: string
  sizeBytes?: number
}