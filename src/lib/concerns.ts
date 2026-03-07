export interface Concern {
  id: string
  ja: string
  en: string
  icon: string
  descJa: string
  descEn: string
  yogaStyles: string[]       // maps to instructor yoga_styles
  articleCategories: string[] // maps to wellness_articles category
  videoCategories: string[]   // maps to wellness_videos category
}

export const CONCERNS: Concern[] = [
  {
    id: 'shoulder',
    ja: '肩こり',
    en: 'Shoulder tension',
    icon: '💆',
    descJa: '肩・首のこりをほぐしたい',
    descEn: 'Release shoulder & neck tension',
    yogaStyles: ['Hatha', 'Yin', 'Restorative'],
    articleCategories: ['yoga', 'breathing', 'ayurveda'],
    videoCategories: ['meditation', 'breathwork', 'shoulder', 'flexibility'],
  },
  {
    id: 'stress',
    ja: 'ストレス',
    en: 'Stress relief',
    icon: '🧘',
    descJa: '心と体のストレスをリセット',
    descEn: 'Reset mind & body stress',
    yogaStyles: ['Yin', 'Restorative', 'Kundalini'],
    articleCategories: ['mindfulness', 'breathing', 'ayurveda'],
    videoCategories: ['meditation', 'breathwork', 'stress', 'evening'],
  },
  {
    id: 'neck',
    ja: '首の痛み',
    en: 'Neck pain',
    icon: '🔵',
    descJa: '首まわりの不快感を改善',
    descEn: 'Ease neck discomfort',
    yogaStyles: ['Yin', 'Restorative', 'Hatha'],
    articleCategories: ['yoga', 'breathing'],
    videoCategories: ['meditation', 'shoulder'],
  },
  {
    id: 'eyes',
    ja: '目の疲れ',
    en: 'Eye fatigue',
    icon: '👁️',
    descJa: 'PC・スマホ疲れをリセット',
    descEn: 'Reset screen fatigue',
    yogaStyles: ['Restorative', 'Yin'],
    articleCategories: ['mindfulness', 'breathing'],
    videoCategories: ['meditation', 'stress'],
  },
  {
    id: 'flexibility',
    ja: '柔軟性UP',
    en: 'Flexibility',
    icon: '🤸',
    descJa: '体を柔らかくして動きを楽に',
    descEn: 'Improve range of motion',
    yogaStyles: ['Hatha', 'Yin', 'Ashtanga'],
    articleCategories: ['yoga'],
    videoCategories: ['morning', 'flexibility', 'balance'],
  },
  {
    id: 'posture',
    ja: '姿勢改善',
    en: 'Better posture',
    icon: '🪑',
    descJa: 'デスクワークで崩れた姿勢を整える',
    descEn: 'Correct posture from desk work',
    yogaStyles: ['Iyengar', 'Hatha', 'Power Yoga'],
    articleCategories: ['yoga', 'ayurveda'],
    videoCategories: ['morning', 'core', 'flexibility'],
  },
  {
    id: 'sleep',
    ja: '不眠改善',
    en: 'Better sleep',
    icon: '😴',
    descJa: '深い眠りのために体と心を整える',
    descEn: 'Prepare body & mind for deep sleep',
    yogaStyles: ['Yin', 'Restorative'],
    articleCategories: ['mindfulness', 'breathing'],
    videoCategories: ['meditation', 'evening', 'sleep', 'stress'],
  },
  {
    id: 'focus',
    ja: '集中力UP',
    en: 'Focus & clarity',
    icon: '⚡',
    descJa: '仕事・学習の集中力を高める',
    descEn: 'Sharpen focus for work & study',
    yogaStyles: ['Kundalini', 'Hatha', 'Vinyasa'],
    articleCategories: ['mindfulness', 'breathing'],
    videoCategories: ['breathwork', 'morning', 'stress'],
  },
  {
    id: 'core',
    ja: '体幹強化',
    en: 'Core strength',
    icon: '💪',
    descJa: '体の中心を鍛えて安定感を高める',
    descEn: 'Build a stable, strong core',
    yogaStyles: ['Vinyasa', 'Power Yoga', 'Ashtanga'],
    articleCategories: ['yoga', 'nutrition'],
    videoCategories: ['morning', 'core', 'balance', 'arm_balance'],
  },
  {
    id: 'recovery',
    ja: '疲労回復',
    en: 'Recovery',
    icon: '✨',
    descJa: '溜まった疲れをしっかり癒す',
    descEn: 'Relieve accumulated fatigue',
    yogaStyles: ['Restorative', 'Yin', 'Chair Yoga'],
    articleCategories: ['nutrition', 'ayurveda'],
    videoCategories: ['meditation', 'evening', 'sleep', 'flexibility'],
  },
]
