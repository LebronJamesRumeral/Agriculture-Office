export type RecordType = 'Farmer' | 'Fisherfolk' | 'Both'
export type RecordStatus = 'Active' | 'Inactive'
export type RecordGender = 'Male' | 'Female' | 'Others'
export type RecordCivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated'

export const RECORD_GENDER_VALUES: RecordGender[] = ['Male', 'Female', 'Others']
export const RECORD_CIVIL_STATUS_VALUES: RecordCivilStatus[] = [
  'Single',
  'Married',
  'Widowed',
  'Separated',
]

export type RecordRow = {
  id: number
  name: string | null
  type: string | null
  barangay: string | null
  contact_number: string | null
  crop_type: string | null
  years_experience: number | null
  created_at: string
  status: string | null
  last_name: string | null
  first_name: string | null
  middle_name: string | null
  ext_name: string | null
  birthdate: string | null
  age: number | null
  gender: string | null
  civil_status: string | null
  designation: string | null
  una_kard: string | null
  imc: string | null
  u_mobile_account: string | null
  lgu_code_no: string | null
  ffrs_system_generated_no: string | null
  ffrs_date_encoded: string | null
  fishr_no: string | null
  contact_no: string | null
  association: string | null
  family_members: number | null
  organic: string | null
  four_ps_member: string | null
  ips_member: string | null
  pwd_member: string | null
  senior_citizen: string | null
  solo_parent: string | null
  severely_stunted_children: number | null
  mother_maiden_name: string | null
  household_head: string | null
  household_head_specify: string | null
  type_of_id: string | null
  id_no: string | null
  farmer_fisherfolk_both: string | null
  farm_type: string | null
  crop_area_or_heads: string | null
  crop_name: string | null
  remarks: string | null
}

export type RecordItem = {
  id: number
  name: string
  type: RecordType
  barangay: string
  contactNumber: string
  cropType: string
  yearsExperience: number | null
  createdAt: string
  status: RecordStatus | null
  lastName?: string
  firstName?: string
  middleName?: string
  extName?: string
  birthdate?: string
  age?: string
  gender?: RecordGender
  civilStatus?: RecordCivilStatus
  designation?: string
  unaKard?: string
  imc?: string
  uMobileAccount?: string
  lguCodeNo?: string
  ffrsSystemGeneratedNo?: string
  ffrsDateEncoded?: string
  fishrNo?: string
  contactNo?: string
  association?: string
  familyMembers?: string
  organic?: string
  fourPsMember?: string
  ipsMember?: string
  pwdMember?: string
  seniorCitizen?: string
  soloParent?: string
  severelyStuntedChildren?: string
  motherMaidenName?: string
  householdHead?: string
  householdHeadSpecify?: string
  typeOfId?: string
  idNo?: string
  farmerFisherfolkBoth?: string
  farmType?: string
  cropAreaOrHeads?: string
  cropName?: string
  remarks?: string
}

export function normalizeRecordType(value?: string | null): RecordType {
  if (value === 'Farmer' || value === 'Fisherfolk' || value === 'Both') return value
  return 'Farmer'
}

export function normalizeRecordStatus(value?: string | null): RecordStatus | null {
  if (value === 'Active' || value === 'Inactive') return value
  return null
}

export function normalizeRecordGender(value?: string | null): RecordGender | undefined {
  if (value === 'Male' || value === 'Female' || value === 'Others') return value
  return undefined
}

export function normalizeRecordCivilStatus(value?: string | null): RecordCivilStatus | undefined {
  if (value === 'Single' || value === 'Married' || value === 'Widowed' || value === 'Separated') {
    return value
  }
  return undefined
}

export function formatRecordDate(value?: string | null): string {
  if (!value) return ''

  const trimmedValue = value.trim()
  if (!trimmedValue) return ''

  const isoLikeDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue)
  if (isoLikeDate) {
    const [, year, month, day] = isoLikeDate
    return `${day}/${month}/${year}`
  }

  const parsedDate = new Date(trimmedValue)
  if (Number.isNaN(parsedDate.getTime())) return trimmedValue

  const day = String(parsedDate.getDate()).padStart(2, '0')
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const year = parsedDate.getFullYear()

  return `${day}/${month}/${year}`
}

export function buildDisplayName(record: {
  name?: string | null
  firstName?: string | null
  middleName?: string | null
  lastName?: string | null
  extName?: string | null
}): string {
  if (record.name && record.name.trim().length > 0) return record.name
  const parts = [record.firstName, record.middleName, record.lastName, record.extName]
    .filter((value) => value && value.trim().length > 0)
  return parts.join(' ').trim()
}

export function mapRecordRow(row: RecordRow): RecordItem {
  const recordType = normalizeRecordType(row.farmer_fisherfolk_both ?? row.type)
  const name = row.name ?? buildDisplayName({
    firstName: row.first_name,
    middleName: row.middle_name,
    lastName: row.last_name,
    extName: row.ext_name,
  })

  return {
    id: row.id,
    name,
    type: recordType,
    barangay: row.barangay ?? '',
    contactNumber: row.contact_number ?? row.contact_no ?? '',
    cropType: row.crop_type ?? row.crop_name ?? '',
    yearsExperience: row.years_experience,
    createdAt: row.created_at,
    status: normalizeRecordStatus(row.status),
    lastName: row.last_name ?? undefined,
    firstName: row.first_name ?? undefined,
    middleName: row.middle_name ?? undefined,
    extName: row.ext_name ?? undefined,
    birthdate: row.birthdate ?? undefined,
    age: row.age !== null && row.age !== undefined ? String(row.age) : undefined,
    gender: normalizeRecordGender(row.gender),
    civilStatus: normalizeRecordCivilStatus(row.civil_status),
    designation: row.designation ?? undefined,
    unaKard: row.una_kard ?? undefined,
    imc: row.imc ?? undefined,
    uMobileAccount: row.u_mobile_account ?? undefined,
    lguCodeNo: row.lgu_code_no ?? undefined,
    ffrsSystemGeneratedNo: row.ffrs_system_generated_no ?? undefined,
    ffrsDateEncoded: row.ffrs_date_encoded ?? undefined,
    fishrNo: row.fishr_no ?? undefined,
    contactNo: row.contact_no ?? undefined,
    association: row.association ?? undefined,
    familyMembers: row.family_members !== null && row.family_members !== undefined ? String(row.family_members) : undefined,
    organic: row.organic ?? undefined,
    fourPsMember: row.four_ps_member ?? undefined,
    ipsMember: row.ips_member ?? undefined,
    pwdMember: row.pwd_member ?? undefined,
    seniorCitizen: row.senior_citizen ?? undefined,
    soloParent: row.solo_parent ?? undefined,
    severelyStuntedChildren: row.severely_stunted_children !== null && row.severely_stunted_children !== undefined ? String(row.severely_stunted_children) : undefined,
    motherMaidenName: row.mother_maiden_name ?? undefined,
    householdHead: row.household_head ?? undefined,
    householdHeadSpecify: row.household_head_specify ?? undefined,
    typeOfId: row.type_of_id ?? undefined,
    idNo: row.id_no ?? undefined,
    farmerFisherfolkBoth: row.farmer_fisherfolk_both ?? undefined,
    farmType: row.farm_type ?? undefined,
    cropAreaOrHeads: row.crop_area_or_heads ?? undefined,
    cropName: row.crop_name ?? undefined,
    remarks: row.remarks ?? undefined,
  }
}

export function buildRecordNameFromParts(data: {
  firstName?: string
  middleName?: string
  lastName?: string
  extName?: string
}): string {
  const parts = [data.firstName, data.middleName, data.lastName, data.extName]
    .filter((value) => value && value.trim().length > 0)
  return parts.join(' ').trim()
}
