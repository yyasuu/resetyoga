export interface ArticlePreset {
  id: string
  title_ja: string
  title_en: string
  category: string
  concerns: string[]
}

export const ARTICLE_PRESETS: ArticlePreset[] = [
  // ── 肩こり ──────────────────────────────────────
  {
    id: 'shoulder-poses',
    title_ja: '肩こりに効くヨガポーズ5選',
    title_en: '5 Yoga Poses That Relieve Shoulder Tension',
    category: 'yoga',
    concerns: ['shoulder'],
  },
  {
    id: 'desk-neck-shoulder',
    title_ja: 'デスクワーカーのための首・肩ケア',
    title_en: 'Neck & Shoulder Care for Desk Workers',
    category: 'yoga',
    concerns: ['shoulder', 'neck', 'posture'],
  },

  // ── 首の痛み ──────────────────────────────────────
  {
    id: 'neck-posture',
    title_ja: '首の痛みと姿勢の深い関係',
    title_en: 'How Posture Drives Neck Pain',
    category: 'yoga',
    concerns: ['neck', 'posture'],
  },
  {
    id: 'neck-breathing',
    title_ja: '首の緊張をほぐす呼吸法とストレッチ',
    title_en: 'Breathing & Stretches to Release Neck Tension',
    category: 'breathing',
    concerns: ['neck', 'shoulder', 'stress'],
  },

  // ── 目の疲れ ──────────────────────────────────────
  {
    id: 'screen-fatigue',
    title_ja: 'PC・スマホ疲れをリセットするヨガ',
    title_en: 'Yoga to Reset Screen Fatigue',
    category: 'yoga',
    concerns: ['eyes'],
  },
  {
    id: 'eye-mindfulness',
    title_ja: '目の疲れに効くマインドフルネス瞑想',
    title_en: 'Mindfulness Meditation for Eye Fatigue',
    category: 'mindfulness',
    concerns: ['eyes', 'stress'],
  },

  // ── ストレス ──────────────────────────────────────
  {
    id: 'stress-reset',
    title_ja: 'ストレスをリセットするヨガ習慣',
    title_en: 'Yoga Habits to Reset Daily Stress',
    category: 'yoga',
    concerns: ['stress'],
  },
  {
    id: 'stress-breathing',
    title_ja: '呼吸で整える — 不安とストレスへのアプローチ',
    title_en: 'Breathing Through Anxiety & Stress',
    category: 'breathing',
    concerns: ['stress', 'sleep', 'focus'],
  },
  {
    id: 'stress-ayurveda',
    title_ja: 'アーユルヴェーダ式ストレスケア',
    title_en: 'Ayurvedic Approach to Stress Relief',
    category: 'ayurveda',
    concerns: ['stress', 'recovery'],
  },

  // ── 不眠改善 ──────────────────────────────────────
  {
    id: 'sleep-yoga',
    title_ja: '眠れない夜のためのヨガと呼吸法',
    title_en: 'Yoga & Breathing for Restless Nights',
    category: 'yoga',
    concerns: ['sleep', 'stress'],
  },
  {
    id: 'sleep-ayurveda',
    title_ja: 'アーユルヴェーダで整える睡眠の質',
    title_en: 'Improving Sleep Quality with Ayurveda',
    category: 'ayurveda',
    concerns: ['sleep', 'recovery'],
  },

  // ── 柔軟性UP ──────────────────────────────────────
  {
    id: 'flexibility-morning',
    title_ja: '柔軟性を高める朝のヨガルーティン',
    title_en: 'Morning Yoga Routine for Flexibility',
    category: 'yoga',
    concerns: ['flexibility'],
  },
  {
    id: 'flexibility-yin',
    title_ja: '陰ヨガ（Yin Yoga）で体を深くほぐす方法',
    title_en: 'How Yin Yoga Deeply Opens the Body',
    category: 'yoga',
    concerns: ['flexibility', 'recovery', 'stress'],
  },

  // ── 姿勢改善 ──────────────────────────────────────
  {
    id: 'posture-core',
    title_ja: '姿勢改善の鍵は体幹にある',
    title_en: 'Good Posture Starts with a Strong Core',
    category: 'yoga',
    concerns: ['posture', 'core'],
  },
  {
    id: 'posture-ayurveda',
    title_ja: '姿勢と体質の意外なつながり',
    title_en: 'The Surprising Link Between Posture & Dosha',
    category: 'ayurveda',
    concerns: ['posture'],
  },

  // ── 集中力UP ──────────────────────────────────────
  {
    id: 'focus-pranayama',
    title_ja: '集中力を高めるプラナヤマ入門',
    title_en: 'Pranayama for Sharper Focus',
    category: 'breathing',
    concerns: ['focus'],
  },
  {
    id: 'focus-morning',
    title_ja: '仕事前の5分ヨガで集中力をUP',
    title_en: '5-Minute Pre-Work Yoga for Focus',
    category: 'yoga',
    concerns: ['focus', 'stress'],
  },

  // ── 体幹強化 ──────────────────────────────────────
  {
    id: 'core-intro',
    title_ja: '体幹を鍛えるヨガポーズ入門',
    title_en: 'Introduction to Core-Strengthening Yoga Poses',
    category: 'yoga',
    concerns: ['core'],
  },
  {
    id: 'core-nutrition',
    title_ja: '体幹強化を助ける食事とプロテイン',
    title_en: 'Nutrition & Protein to Support Core Training',
    category: 'nutrition',
    concerns: ['core', 'recovery'],
  },

  // ── 疲労回復 ──────────────────────────────────────
  {
    id: 'recovery-restorative',
    title_ja: '疲労回復に最適なリストラティブヨガ',
    title_en: 'Restorative Yoga for Deep Recovery',
    category: 'yoga',
    concerns: ['recovery'],
  },
  {
    id: 'recovery-nutrition',
    title_ja: 'ヨガ後の回復を早める食事ガイド',
    title_en: 'Post-Yoga Nutrition Guide for Faster Recovery',
    category: 'nutrition',
    concerns: ['recovery', 'core'],
  },

  // ── 総合 / アーユルヴェーダ ──────────────────────────────────────
  {
    id: 'dosha-yoga',
    title_ja: '体質（ドーシャ）とヨガスタイルの選び方',
    title_en: 'Finding Your Yoga Style by Dosha Type',
    category: 'ayurveda',
    concerns: ['stress', 'recovery', 'flexibility'],
  },
  {
    id: 'pranayama-intro',
    title_ja: 'プラナヤマ入門 — 呼吸が変わると人生が変わる',
    title_en: 'Introduction to Pranayama — Transform Your Life Through Breath',
    category: 'breathing',
    concerns: ['stress', 'focus', 'sleep'],
  },
  {
    id: 'yoga-before-after-meal',
    title_ja: 'ヨガ前後の食事ガイド — 体を内側から整える',
    title_en: 'What to Eat Before & After Yoga',
    category: 'nutrition',
    concerns: ['recovery', 'core'],
  },
]
