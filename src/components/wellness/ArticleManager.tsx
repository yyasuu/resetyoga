'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Trash2, Eye, EyeOff, Plus, Pencil } from 'lucide-react'

interface WellnessArticle {
  id: string
  title_ja: string
  title_en: string
  category: string
  is_published: boolean
  author_id: string
  created_at: string
  profiles: { full_name: string | null; role: string } | null
}

const CATEGORY_LABELS: Record<string, string> = {
  ayurveda: 'アーユルヴェーダ',
  nutrition: '食事',
  breathing: '呼吸法',
  mindfulness: 'マインドフルネス',
  yoga: 'ヨガ理論',
}

interface ArticleManagerProps {
  initialArticles: WellnessArticle[]
  newArticleHref: string
  locale?: string
}

export function ArticleManager({ initialArticles, newArticleHref, locale = 'en' }: ArticleManagerProps) {
  const [articles, setArticles] = useState<WellnessArticle[]>(initialArticles)

  const togglePublish = async (article: WellnessArticle) => {
    const newState = !article.is_published
    setArticles(articles.map(a => a.id === article.id ? { ...a, is_published: newState } : a))
    await fetch(`/api/wellness/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: newState }),
    })
  }

  const deleteArticle = async (id: string) => {
    if (!confirm(locale === 'ja' ? 'このコラムを削除しますか？' : 'Delete this article?')) return
    setArticles(articles.filter(a => a.id !== id))
    await fetch(`/api/wellness/articles/${id}`, { method: 'DELETE' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-navy-500 dark:text-navy-400" />
          ウェルネスコラム / Wellness Articles
          <span className="ml-2 text-sm font-normal text-gray-400 dark:text-navy-400">({articles.length})</span>
        </h2>
        <Link href={newArticleHref}>
          <Button size="sm" className="bg-navy-600 hover:bg-navy-700 text-white gap-1">
            <Plus className="h-4 w-4" />
            コラムを書く
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-navy-400 py-4">
          {locale === 'ja' ? 'コラムがまだありません' : 'No articles yet'}
        </p>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-700 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-linen-200 dark:bg-navy-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-navy-600 dark:text-navy-300" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{article.title_ja}</p>
                  <p className="text-xs text-gray-400 dark:text-navy-400 truncate">
                    {CATEGORY_LABELS[article.category] ?? article.category}
                    {article.profiles?.full_name ? ` · ${article.profiles.full_name}` : ''}
                    {article.profiles?.role === 'instructor' ? ' (講師)' : article.profiles?.role === 'admin' ? ' (管理者)' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  article.is_published
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-navy-600 text-gray-500 dark:text-navy-300'
                }`}>
                  {article.is_published ? (locale === 'ja' ? '公開中' : 'Published') : (locale === 'ja' ? '下書き' : 'Draft')}
                </span>
                <button
                  onClick={() => togglePublish(article)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-600 text-gray-500 dark:text-navy-300"
                >
                  {article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Link href={`/wellness/articles/${article.id}/edit`}>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-600 text-gray-500 dark:text-navy-300">
                    <Pencil className="h-4 w-4" />
                  </button>
                </Link>
                <button
                  onClick={() => deleteArticle(article.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
