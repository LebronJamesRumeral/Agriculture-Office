const cleanNameString = (str) => {
  if (!str) return ''
  const cleaned = str.trim().toLowerCase().replace(/\s+/g, ' ')
  if (cleaned === 'n/a' || cleaned === 'none' || cleaned === '-' || cleaned === '—' || cleaned === 'na') {
    return ''
  }
  return cleaned
}

const getUnifiedNormalizedName = (row) => {
  const firstName = cleanNameString(row.first_name)
  const lastName = cleanNameString(row.last_name)
  
  if (firstName && lastName) {
    const parts = [row.first_name, row.middle_name, row.last_name, row.ext_name]
      .map(cleanNameString)
      .filter(Boolean)
    return parts.join(' ').replace(/\s+/g, ' ')
  }

  const nameVal = cleanNameString(row.name)
  if (nameVal) return nameVal

  const parts = [row.first_name, row.middle_name, row.last_name, row.ext_name]
    .map(cleanNameString)
    .filter(Boolean)
  return parts.join(' ').replace(/\s+/g, ' ')
}

const normalizeKeyValue = (value) => (value ?? '').trim().toLowerCase()

const normalizeComparableValue = (value) => {
  if (value === null || value === undefined) return ''
  const str = String(value).trim().toLowerCase()
  if (str === 'n/a' || str === 'none' || str === '-' || str === '—' || str === 'na') return ''
  return str
}

const isValidIdentifier = (val) => {
  const cleaned = val.trim().toLowerCase()
  return (
    cleaned !== '' &&
    cleaned !== 'n/a' &&
    cleaned !== 'na' &&
    cleaned !== 'none' &&
    cleaned !== 'not applicable' &&
    cleaned !== 'not_applicable' &&
    cleaned !== 'not applicable.' &&
    cleaned !== 'null' &&
    cleaned !== '-' &&
    cleaned !== '—'
  )
}

const isSamePerson = (rec1, rec2) => {
  const first1 = normalizeComparableValue(rec1.first_name)
  const first2 = normalizeComparableValue(rec2.first_name)
  const last1 = normalizeComparableValue(rec1.last_name)
  const last2 = normalizeComparableValue(rec2.last_name)
  
  return first1 === first2 && last1 === last2
}

// Simulated lookup maps
const lookupById = new Map()
const lookupByLgu = new Map()
const lookupByFishr = new Map()
const lookupByPerson = new Map()
const lookupByFallback = new Map()
const lookupByNameBrgy = new Map()
const lookupByName = new Map()

const registerLookup = (record) => {
  const payload = record.payload

  const idNo = normalizeKeyValue(payload.id_no)
  if (idNo && isValidIdentifier(idNo) && !lookupById.has(idNo)) lookupById.set(idNo, record)

  const lguCode = normalizeKeyValue(payload.lgu_code_no)
  if (lguCode && isValidIdentifier(lguCode) && !lookupByLgu.has(lguCode)) lookupByLgu.set(lguCode, record)

  const fishrNo = normalizeKeyValue(payload.fishr_no)
  if (fishrNo && isValidIdentifier(fishrNo) && !lookupByFishr.has(fishrNo)) lookupByFishr.set(fishrNo, record)

  const nameKey = getUnifiedNormalizedName(payload)
  const birthdate = normalizeKeyValue(payload.birthdate)
  if (nameKey && birthdate) {
    const personKey = `${nameKey}|${birthdate}`
    if (!lookupByPerson.has(personKey)) lookupByPerson.set(personKey, record)
  }

  const barangay = normalizeKeyValue(payload.barangay)
  const contact = normalizeKeyValue(payload.contact_no ?? payload.contact_number)
  if (nameKey && barangay && contact) {
    const fallbackKey = `${nameKey}|${barangay}|${contact}`
    if (!lookupByFallback.has(fallbackKey)) lookupByFallback.set(fallbackKey, record)
  }

  if (nameKey && barangay) {
    const nameBrgyKey = `${nameKey}|${barangay}`
    if (!lookupByNameBrgy.has(nameBrgyKey)) lookupByNameBrgy.set(nameBrgyKey, record)
  }

  if (nameKey && !lookupByName.has(nameKey)) {
    lookupByName.set(nameKey, record)
  }
}

const findMatchingRecord = (incoming) => {
  const idNo = normalizeKeyValue(incoming.id_no)
  if (idNo && isValidIdentifier(idNo) && lookupById.has(idNo)) return lookupById.get(idNo)

  const lguCode = normalizeKeyValue(incoming.lgu_code_no)
  if (lguCode && isValidIdentifier(lguCode) && lookupByLgu.has(lguCode)) return lookupByLgu.get(lguCode)

  const fishrNo = normalizeKeyValue(incoming.fishr_no)
  if (fishrNo && isValidIdentifier(fishrNo) && lookupByFishr.has(fishrNo)) return lookupByFishr.get(fishrNo)

  const checkNameMatch = (matched) => {
    if (!matched) return undefined
    if (isSamePerson(incoming, matched.payload)) return matched
    return undefined
  }

  const nameKey = getUnifiedNormalizedName(incoming)
  const birthdate = normalizeKeyValue(incoming.birthdate)
  if (nameKey && birthdate) {
    const personKey = `${nameKey}|${birthdate}`
    const matched = lookupByPerson.get(personKey)
    const verified = checkNameMatch(matched)
    if (verified) return verified
  }

  const barangay = normalizeKeyValue(incoming.barangay)
  const contact = normalizeKeyValue(incoming.contact_no ?? incoming.contact_number)
  const nameParts = nameKey.split(' ')
  if (nameKey && nameParts.length >= 2 && barangay && contact) {
    const fallbackKey = `${nameKey}|${barangay}|${contact}`
    const matched = lookupByFallback.get(fallbackKey)
    const verified = checkNameMatch(matched)
    if (verified) return verified
  }

  if (nameKey && nameParts.length >= 2 && barangay) {
    const nameBrgyKey = `${nameKey}|${barangay}`
    const matched = lookupByNameBrgy.get(nameBrgyKey)
    const verified = checkNameMatch(matched)
    if (verified) return verified
  }

  return undefined
}

// -------------------------------------------------------------
// Test Case
// -------------------------------------------------------------

// Existing database records
const dbErickAbad = {
  id: 2,
  payload: {
    first_name: 'Erick',
    last_name: 'Abad',
    middle_name: 'Villacencio',
    ext_name: 'N/A',
    name: 'Erick Villacencio Abad N/A',
    fishr_no: 'Not Applicable', // Note the placeholder value
    birthdate: '1987-05-19',
    barangay: 'Sta.Rita'
  }
}

// Register Erick Abad in simulated lookup maps
registerLookup(dbErickAbad)

// Incoming records to test
const incomingDunritzAbad = {
  first_name: 'Dunritz',
  last_name: 'Abad',
  middle_name: 'Llamas',
  ext_name: 'N/A',
  name: 'Dunritz Llamas Abad N/A',
  fishr_no: 'Not Applicable',
  birthdate: '1980-10-29',
  barangay: 'Sta.Rita'
}

const incomingErickAbad = {
  first_name: 'Erick',
  last_name: 'Abad',
  middle_name: 'Villacencio',
  ext_name: 'N/A',
  name: 'Erick Villacencio Abad N/A',
  fishr_no: 'Not Applicable',
  birthdate: '1987-05-19',
  barangay: 'Sta.Rita'
}

const incomingMarlynAbad = {
  first_name: 'Marlyn',
  last_name: 'Abad',
  middle_name: 'Guzon',
  ext_name: 'N/A',
  name: 'Marlyn Guzon Abad N/A',
  fishr_no: 'Not Applicable',
  birthdate: '1973-09-27',
  barangay: 'New Cabalan'
}

console.log('--- RUNNING IMPORT LOGIC TESTS ---')

// 1. Dunritz Abad should NOT match Erick Abad
const matchDunritz = findMatchingRecord(incomingDunritzAbad)
console.log('Dunritz Abad match found:', matchDunritz ? `YES (ID: ${matchDunritz.id}, Name: ${matchDunritz.payload.name})` : 'NO (Correct!)')
if (matchDunritz) {
  console.error('FAIL: Dunritz Abad incorrectly identified as duplicate!');
  process.exit(1)
}

// 2. Marlyn Abad should NOT match Erick Abad
const matchMarlyn = findMatchingRecord(incomingMarlynAbad)
console.log('Marlyn Abad match found:', matchMarlyn ? `YES (ID: ${matchMarlyn.id}, Name: ${matchMarlyn.payload.name})` : 'NO (Correct!)')
if (matchMarlyn) {
  console.error('FAIL: Marlyn Abad incorrectly identified as duplicate!');
  process.exit(1)
}

// 3. Erick Abad SHOULD match Erick Abad
const matchErick = findMatchingRecord(incomingErickAbad)
console.log('Erick Abad match found:', matchErick ? `YES (ID: ${matchErick.id}, Name: ${matchErick.payload.name}) (Correct!)` : 'NO')
if (!matchErick || matchErick.id !== 2) {
  console.error('FAIL: Erick Abad not identified as duplicate!');
  process.exit(1)
}

console.log('ALL TESTS PASSED SUCCESSFULLY!')
