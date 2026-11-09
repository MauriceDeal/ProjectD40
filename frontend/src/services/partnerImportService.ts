import readXlsxFile from 'read-excel-file/browser'
import type { PartnerStatus } from '../types/partner'

export interface ImportedPartner {
  name: string
  category: string
  region: string
  status: PartnerStatus
  contactName: string
  contactEmail: string
  contactPhone: string
  owner: string
  annualValue: string
  contractEndDate: string
  summary: string
}

type Cell = string | number | boolean | Date | typeof Date | null

function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === delimiter && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }

  if (quoted) throw new Error('Het CSV-bestand bevat een niet-afgesloten aanhalingsteken.')
  row.push(cell)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

function cellText(value: Cell | undefined): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value == null ? '' : String(value).trim()
}

function headerKey(value: Cell | undefined): string {
  return cellText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl-NL').replace(/[^a-z0-9]/g, '')
}

function toPartner(rows: Cell[][]): ImportedPartner[] {
  if (rows.length < 2) throw new Error('Het bestand bevat geen partnerregels.')

  const headers = rows[0].map(headerKey)
  const indexOf = (...keys: string[]) => headers.findIndex((header) => keys.includes(header))
  const nameIndex = indexOf('partner', 'partnernaam', 'naam', 'organisatie', 'organisatienaam')
  if (nameIndex < 0) throw new Error('Kolom Partner of Partnernaam ontbreekt in het bestand.')

  const value = (row: Cell[], ...keys: string[]) => cellText(row[indexOf(...keys)])
  const partners = rows.slice(1).map((row) => {
    const name = cellText(row[nameIndex])
    const rawStatus = value(row, 'status').toLocaleLowerCase('nl-NL')
    const status: PartnerStatus = rawStatus === 'actief' ? 'Actief'
      : rawStatus === 'in gesprek' ? 'In gesprek'
        : rawStatus === 'aandacht nodig' ? 'Aandacht nodig' : 'Onbekend'
    const date = value(row, 'contracteinddatum', 'contracteindigt', 'einddatum')
    return {
      name,
      category: value(row, 'sector', 'partnertype', 'categorie') || 'Overig',
      region: value(row, 'regio', 'plaats', 'gemeente') || 'Niet opgegeven',
      status,
      contactName: value(row, 'contactpersoon', 'contact'),
      contactEmail: value(row, 'email', 'e-mail', 'contactemail'),
      contactPhone: value(row, 'telefoon', 'telefoonnummer', 'phone'),
      owner: value(row, 'eigenaar', 'relatiebeheerder', 'owner') || 'Nog niet toegewezen',
      annualValue: value(row, 'jaarwaarde', 'jaarlijksewaarde', 'waarde') || 'Nog te bepalen',
      contractEndDate: date,
      summary: value(row, 'samenvatting', 'omschrijving', 'summary') || 'Geïmporteerd uit een lokaal bestand.',
    }
  })
  const validPartners = partners.filter((partner) => partner.name.length > 0)
  if (!validPartners.length) throw new Error('Er zijn geen partnernamen gevonden in het bestand.')
  return validPartners
}

export async function readPartnerFile(file: File): Promise<ImportedPartner[]> {
  let rows: Cell[][]
  if (file.name.toLocaleLowerCase('nl-NL').endsWith('.csv')) {
    rows = parseCsv((await file.text()).replace(/^\uFEFF/, ''))
  } else {
    const sheets = await readXlsxFile(file)
    if (!sheets.length) throw new Error('Het Excel-bestand bevat geen werkbladen.')
    rows = sheets[0].data
  }
  return toPartner(rows)
}
