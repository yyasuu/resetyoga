export interface PoseFamily {
  value: string
  ja: string
  en: string
}

export interface DifficultyLevel {
  value: string
  ja: string
  en: string
}

export const POSE_FAMILIES: PoseFamily[] = [
  { value: 'standing',     ja: '立位',         en: 'Standing' },
  { value: 'seated',       ja: '座位',         en: 'Seated' },
  { value: 'supine',       ja: '仰臥位',       en: 'Supine' },
  { value: 'prone',        ja: '腹臥位',       en: 'Prone' },
  { value: 'inversion',    ja: '逆転',         en: 'Inversion' },
  { value: 'balance',      ja: 'バランス',     en: 'Balance' },
  { value: 'backbend',     ja: '後屈',         en: 'Backbend' },
  { value: 'forward_fold', ja: '前屈',         en: 'Forward Fold' },
  { value: 'twist',        ja: 'ねじり',       en: 'Twist' },
  { value: 'arm_balance',  ja: 'アームバランス', en: 'Arm Balance' },
]

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { value: 'beginner',     ja: '初級', en: 'Beginner' },
  { value: 'intermediate', ja: '中級', en: 'Intermediate' },
  { value: 'advanced',     ja: '上級', en: 'Advanced' },
]

export interface YogaPose {
  id: string
  name_sanskrit: string
  name_en: string
  name_ja: string
  image_url: string | null
  description_ja: string | null
  description_en: string | null
  how_to_ja: string | null
  how_to_en: string | null
  pose_family: string | null
  concerns: string[] | null
  difficulty: string | null
  variation_number: number | null
  access_level: string
  is_published: boolean
  created_at: string
}
