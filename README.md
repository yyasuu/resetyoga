# YogaConnect 🧘

グローバルなオンラインヨガプラットフォーム。インド・日本など世界中の認定講師が45分授業枠を設定し、生徒がGoogle Meet経由でリアルタイムレッスンを受けられる。

## 機能

- **講師**: カレンダーから45分枠を追加・削除
- **生徒**: 講師一覧を検索・フィルタリング → 空き枠を予約 → Google MeetリンクをEメールで受信
- **決済**: Stripe サブスクリプション（無料2回 → $19.99/月・4コマ）
- **UI言語**: 英語 / 日本語

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database/Auth**: Supabase (PostgreSQL + RLS)
- **Styling**: Tailwind CSS + shadcn/ui
- **Calendar**: FullCalendar
- **Payments**: Stripe
- **Video**: Google Calendar API (Meet link 自動生成)
- **Email**: Resend
- **i18n**: next-intl

## セットアップ

### 1. 環境変数を設定

```bash
cp .env.local.example .env.local
```

### 2. Supabase

1. https://supabase.com でプロジェクトを作成
2. SQL Editor で `supabase/migrations/001_initial.sql` を実行
3. Authentication → Google OAuth を有効化（Redirect URL: `https://your-domain/auth/callback`）

### 3. Stripe

1. 商品・価格を作成: $19.99/月（recurring）
2. Webhook: `https://your-domain/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
3. ローカルテスト: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 4. Google Calendar API

1. Google Cloud Console → Calendar API を有効化
2. サービスアカウント作成・JSONキーをダウンロード
3. 共有カレンダーを作成し、サービスアカウントに「編集者」権限を付与
4. Calendar ID を `.env.local` に設定

### 5. 起動

```bash
npm install
npm run dev
```

http://localhost:3000

## 管理者設定

Supabase Dashboard → `profiles` テーブルで `role` を `admin` に変更。

## デプロイ (Vercel推奨)

```bash
vercel --prod
```

環境変数をVercel Dashboardで設定し、`NEXT_PUBLIC_APP_URL` を本番URLに更新。
