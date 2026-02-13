import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaNeon } from '@prisma/adapter-neon'
import dotenv from 'dotenv'

dotenv.config()
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // ============================================================
  // Clear existing data (in dependency order)
  // ============================================================
  await prisma.reviewSession.deleteMany()
  await prisma.quizAnswer.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.questionTagRelation.deleteMany()
  await prisma.questionOption.deleteMany()
  await prisma.question.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.course.deleteMany()
  await prisma.questionTag.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data.')

  // ============================================================
  // QuestionTags (6 categories, 18 tags)
  // ============================================================
  const tagData = [
    // SEO
    { name: 'SEO基礎', category: 'SEO', description: 'SEOの基本的な概念と手法' },
    { name: 'キーワードリサーチ', category: 'SEO', description: 'キーワード調査と選定の手法' },
    { name: 'テクニカルSEO', category: 'SEO', description: 'サイト構造やページ速度などの技術的SEO' },
    // コンテンツマーケティング
    { name: 'コンテンツ戦略', category: 'コンテンツマーケティング', description: 'コンテンツの企画・戦略立案' },
    { name: 'コピーライティング', category: 'コンテンツマーケティング', description: '効果的な文章作成技術' },
    { name: 'ブログ運営', category: 'コンテンツマーケティング', description: 'ブログの運営とコンテンツ管理' },
    // SNSマーケティング
    { name: 'SNS運用基礎', category: 'SNSマーケティング', description: 'SNS運用の基本的な知識と手法' },
    { name: 'Instagram運用', category: 'SNSマーケティング', description: 'Instagramの活用と運用ノウハウ' },
    { name: 'エンゲージメント分析', category: 'SNSマーケティング', description: 'SNSのエンゲージメント指標の分析' },
    // Web広告
    { name: 'Google広告', category: 'Web広告', description: 'Google広告の設定と運用' },
    { name: 'SNS広告', category: 'Web広告', description: 'SNSプラットフォームでの広告運用' },
    { name: 'リターゲティング', category: 'Web広告', description: 'リターゲティング広告の設計と運用' },
    // AI活用
    { name: 'ChatGPT活用', category: 'AI活用', description: 'ChatGPTのマーケティング活用法' },
    { name: 'プロンプトエンジニアリング', category: 'AI活用', description: '効果的なプロンプトの設計手法' },
    { name: 'AIデータ分析', category: 'AI活用', description: 'AIを活用したデータ分析手法' },
    // データ分析
    { name: 'Googleアナリティクス', category: 'データ分析', description: 'GAを使ったアクセス解析' },
    { name: 'KPI設計', category: 'データ分析', description: 'KPIの設計と効果測定' },
    { name: 'A/Bテスト', category: 'データ分析', description: 'A/Bテストの設計と実施' },
  ]

  const tags: Record<string, { id: string }> = {}
  for (const tag of tagData) {
    const created = await prisma.questionTag.create({ data: tag })
    tags[tag.name] = created
  }

  console.log(`Created ${Object.keys(tags).length} question tags.`)

  // ============================================================
  // Helper: create quiz with questions, options, and tag relations
  // ============================================================
  async function createQuiz(
    lessonId: string,
    title: string,
    questions: {
      text: string
      explanation: string
      options: { text: string; isCorrect: boolean }[]
      tagNames: string[]
    }[]
  ) {
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: `${title} - 全${questions.length}問`,
        passingScore: 70,
        lessonId,
      },
    })

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const question = await prisma.question.create({
        data: {
          text: q.text,
          explanation: q.explanation,
          order: i + 1,
          quizId: quiz.id,
        },
      })

      // Create options
      for (let j = 0; j < q.options.length; j++) {
        await prisma.questionOption.create({
          data: {
            text: q.options[j].text,
            isCorrect: q.options[j].isCorrect,
            order: j + 1,
            questionId: question.id,
          },
        })
      }

      // Create tag relations
      for (const tagName of q.tagNames) {
        if (tags[tagName]) {
          await prisma.questionTagRelation.create({
            data: {
              questionId: question.id,
              tagId: tags[tagName].id,
            },
          })
        }
      }
    }

    return quiz
  }

  // ============================================================
  // Course 1: Webマーケティング基礎
  // ============================================================
  const course1 = await prisma.course.create({
    data: {
      title: 'Webマーケティング基礎',
      description:
        'Webマーケティングの基礎を体系的に学べるコースです。SEO、コンテンツマーケティング、SNSマーケティングの3つの柱を通じて、デジタルマーケティングの全体像を理解します。',
      category: 'Webマーケティング',
      difficulty: 'beginner',
      isPublished: true,
    },
  })

  // --- Course 1, Chapter 1: SEOの基本を理解しよう ---
  const c1ch1 = await prisma.chapter.create({
    data: {
      title: 'SEOの基本を理解しよう',
      description: '検索エンジン最適化の基本概念を学びます。',
      order: 1,
      courseId: course1.id,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '【SEO初心者が分かる！】2025年SEO対策超入門【新常識】',
      type: 'video',
      order: 1,
      chapterId: c1ch1.id,
      youtubeUrl: 'cR0rIszRLAw',
      videoDurationSeconds: 486,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '2025年SEO対策の7つの重要ポイント',
      type: 'text',
      order: 2,
      chapterId: c1ch1.id,
      textContent: `# 2025年SEO対策の7つの重要ポイント

## SEOとは
SEO（Search Engine Optimization：検索エンジン最適化）とは、Googleなどの検索エンジンで自社サイトを上位表示させるための施策の総称です。AI時代の今、従来のキーワード詰め込みだけでは通用しません。

## 1. 最新の検索アルゴリズムへの対応
Googleのアルゴリズムは常に進化しています。AIを活用した検索エンジンは、コンテンツの質や信頼性をより深く評価するようになっています。

## 2. E-E-A-T（経験・専門性・権威性・信頼性）
Googleが重視する品質評価基準です。
- **Experience（経験）**: 実体験に基づいたコンテンツか
- **Expertise（専門性）**: 専門的な知識に基づいているか
- **Authoritativeness（権威性）**: その分野で権威ある情報源か
- **Trustworthiness（信頼性）**: 信頼できる情報を提供しているか

## 3. ドメイン評価・ページ評価の向上
- 良質な被リンクの獲得
- サイトの運営歴と実績
- コンテンツの充実度
- ユーザーからの信頼

## 4. メタデータの最適化
- **titleタグ**: 検索結果に表示されるタイトル。キーワードを含めつつ魅力的に
- **meta description**: 検索結果の説明文。クリック率に影響
- **見出しタグ（h1〜h6）**: コンテンツの構造を明確に

## 5. ユーザーニーズに応えるコンテンツ制作（K-G-D-B）
検索意図は4つに分類されます。
- **Know（知りたい）**: 情報を求めている
- **Go（行きたい）**: 特定のサイトや場所を探している
- **Do（したい）**: 何かを実行したい
- **Buy（買いたい）**: 商品やサービスを購入したい

## 6. 超独自性の高いコンテンツ
他のサイトにはないオリジナルの情報や視点を提供することが重要です。独自の調査データ、実体験、専門家の見解などが差別化のポイントです。

## 7. 正確で最新の情報提供
古い情報や不正確な情報はユーザーの信頼を失い、検索順位にも悪影響を及ぼします。定期的にコンテンツを更新し、最新の情報を保つことが重要です。

## まとめ：ユーザーファーストが最も大切
SEO対策の根本は「ユーザーにとって最も有益なコンテンツを提供すること」です。内部リンクの最適化やSNSでの露出強化も忘れずに取り組みましょう。`,
    },
  })

  const c1ch1quiz = await prisma.lesson.create({
    data: {
      title: 'SEO基礎の理解度チェック',
      type: 'quiz',
      order: 3,
      chapterId: c1ch1.id,
    },
  })

  await createQuiz(c1ch1quiz.id, 'SEO基礎の理解度チェック', [
    // --- SEOの基本概念 ---
    {
      text: 'SEOの正式名称として正しいものはどれですか？',
      explanation:
        'SEOはSearch Engine Optimizationの略で、「検索エンジン最適化」を意味します。検索結果で自社サイトを上位に表示させるための施策全般を指します。',
      options: [
        { text: 'Search Engine Optimization', isCorrect: true },
        { text: 'Search Engine Organization', isCorrect: false },
        { text: 'Social Engine Optimization', isCorrect: false },
        { text: 'Site Enhancement Operation', isCorrect: false },
      ],
      tagNames: ['SEO基礎'],
    },
    {
      text: '2025年のSEO対策において、従来のキーワードの詰め込みだけでは通用しなくなった主な理由は何ですか？',
      explanation:
        'AI時代のGoogleアルゴリズムはコンテンツの質や信頼性をより深く評価するようになり、単純なキーワードの繰り返しでは上位表示されなくなりました。',
      options: [
        { text: 'キーワードの数に上限が設けられたから', isCorrect: false },
        { text: 'AIを活用した検索エンジンがコンテンツの質と信頼性を深く評価するようになったから', isCorrect: true },
        { text: 'Googleが検索サービスを終了したから', isCorrect: false },
        { text: 'キーワード検索自体が廃止されたから', isCorrect: false },
      ],
      tagNames: ['SEO基礎'],
    },
    // --- E-E-A-T ---
    {
      text: 'Googleが重視する品質評価基準「E-E-A-T」の4つの要素として正しい組み合わせはどれですか？',
      explanation:
        'E-E-A-TはExperience（経験）、Expertise（専門性）、Authoritativeness（権威性）、Trustworthiness（信頼性）の頭文字を取ったものです。',
      options: [
        { text: '効率性・専門性・正確性・透明性', isCorrect: false },
        { text: '経験・専門性・権威性・信頼性', isCorrect: true },
        { text: '教育・実験・分析・テスト', isCorrect: false },
        { text: '環境・倫理・認証・技術', isCorrect: false },
      ],
      tagNames: ['SEO基礎'],
    },
    {
      text: 'E-E-A-Tの「Experience（経験）」が評価するのはどのような点ですか？',
      explanation:
        'Experience（経験）は、コンテンツ制作者がそのトピックについて実体験に基づいた情報を提供しているかどうかを評価します。',
      options: [
        { text: 'サイトの運営年数が長いかどうか', isCorrect: false },
        { text: '実体験に基づいたコンテンツであるかどうか', isCorrect: true },
        { text: 'プログラミング経験があるかどうか', isCorrect: false },
        { text: 'ユーザーの滞在時間が長いかどうか', isCorrect: false },
      ],
      tagNames: ['SEO基礎'],
    },
    {
      text: 'E-E-A-Tの「Trustworthiness（信頼性）」を高めるために最も効果的な施策はどれですか？',
      explanation:
        '信頼性を高めるためには、正確で最新の情報を提供し、情報源を明示し、運営者情報を開示することが重要です。',
      options: [
        { text: '広告を大量に掲載する', isCorrect: false },
        { text: 'ページの文字数を増やす', isCorrect: false },
        { text: '正確な情報・情報源の明示・運営者情報の開示', isCorrect: true },
        { text: 'ページのデザインを華やかにする', isCorrect: false },
      ],
      tagNames: ['SEO基礎'],
    },
    // --- ドメイン評価・ページ評価 ---
    {
      text: 'ドメイン評価を向上させるために最も重要な要素はどれですか？',
      explanation:
        '良質な被リンク（他の信頼性の高いサイトからのリンク）を獲得することは、ドメイン評価を向上させる最も重要な要素の一つです。',
      options: [
        { text: 'ドメイン名を短くする', isCorrect: false },
        { text: '良質な被リンクを獲得する', isCorrect: true },
        { text: 'ページ数をとにかく増やす', isCorrect: false },
        { text: 'サーバーを海外に設置する', isCorrect: false },
      ],
      tagNames: ['テクニカルSEO'],
    },
    {
      text: '被リンク（バックリンク）がSEOにおいて重要とされる理由はどれですか？',
      explanation:
        '被リンクは他のサイトからの「推薦」のような役割を果たし、検索エンジンがそのサイトの信頼性や権威性を判断する重要なシグナルとなります。',
      options: [
        { text: 'ページの読み込み速度が向上するから', isCorrect: false },
        { text: '他サイトからの信頼性・権威性の評価シグナルになるから', isCorrect: true },
        { text: 'キーワードの数が増えるから', isCorrect: false },
        { text: '自動的にSNSでシェアされるから', isCorrect: false },
      ],
      tagNames: ['テクニカルSEO'],
    },
    // --- メタデータの最適化 ---
    {
      text: 'メタデータの最適化において、titleタグの役割として正しいものはどれですか？',
      explanation:
        'titleタグは検索結果に表示されるページのタイトルであり、ユーザーのクリック率と検索順位の両方に影響する重要な要素です。',
      options: [
        { text: 'ページのデザインを決定する', isCorrect: false },
        { text: '検索結果に表示されるタイトルで、クリック率と検索順位に影響する', isCorrect: true },
        { text: 'サイトのセキュリティを向上させる', isCorrect: false },
        { text: '画像の代替テキストを表示する', isCorrect: false },
      ],
      tagNames: ['テクニカルSEO'],
    },
    {
      text: 'meta description（メタディスクリプション）の主な役割はどれですか？',
      explanation:
        'meta descriptionは検索結果のタイトル下に表示される説明文です。直接的な検索順位への影響は限定的ですが、ユーザーのクリック率（CTR）に大きく影響します。',
      options: [
        { text: '検索順位を直接決定する', isCorrect: false },
        { text: 'ページの読み込み速度を向上させる', isCorrect: false },
        { text: '検索結果での説明文として表示され、クリック率に影響する', isCorrect: true },
        { text: 'サイト内の内部リンクを生成する', isCorrect: false },
      ],
      tagNames: ['テクニカルSEO'],
    },
    // --- K-G-D-B（検索意図） ---
    {
      text: 'ユーザーの検索意図を分類する「K-G-D-B」の4つのタイプとして正しいものはどれですか？',
      explanation:
        'K-G-D-BはKnow（知りたい）、Go（行きたい）、Do（したい）、Buy（買いたい）の4つの検索意図を表します。',
      options: [
        { text: 'Key・Goal・Data・Brand', isCorrect: false },
        { text: 'Know・Go・Do・Buy', isCorrect: true },
        { text: 'Kind・Good・Deep・Best', isCorrect: false },
        { text: 'Keep・Grow・Develop・Build', isCorrect: false },
      ],
      tagNames: ['キーワードリサーチ'],
    },
    {
      text: '「渋谷 カフェ おすすめ」という検索クエリは、K-G-D-Bのどの検索意図に該当しますか？',
      explanation:
        '特定の場所に関する情報を探しているため「Go（行きたい）」の意図が含まれます。特定の場所やサイトを探す検索はGoクエリに分類されます。',
      options: [
        { text: 'Know（知りたい）', isCorrect: false },
        { text: 'Go（行きたい）', isCorrect: true },
        { text: 'Do（したい）', isCorrect: false },
        { text: 'Buy（買いたい）', isCorrect: false },
      ],
      tagNames: ['キーワードリサーチ'],
    },
    // --- 独自性の高いコンテンツ ---
    {
      text: 'SEOにおいて「超独自性の高いコンテンツ」を作るために最も効果的なアプローチはどれですか？',
      explanation:
        '独自の調査データ、実体験、専門家の見解など、他のサイトにはないオリジナルの情報や視点を提供することがコンテンツの独自性を高めます。',
      options: [
        { text: '競合サイトの内容をリライトする', isCorrect: false },
        { text: 'AIで自動生成した記事を大量に公開する', isCorrect: false },
        { text: '独自の調査データや実体験に基づいたオリジナル情報を提供する', isCorrect: true },
        { text: '人気キーワードをとにかく多く含める', isCorrect: false },
      ],
      tagNames: ['SEO基礎'],
    },
    // --- 正確で最新の情報 ---
    {
      text: 'SEO対策において、古い情報をサイトに放置した場合のリスクとして最も深刻なものはどれですか？',
      explanation:
        '古い情報や不正確な情報はユーザーの信頼を損ない、E-E-A-Tの評価が下がり、結果として検索順位の低下やユーザー離れにつながります。',
      options: [
        { text: 'ページの表示速度が遅くなる', isCorrect: false },
        { text: 'ユーザーの信頼を失い、E-E-A-T評価と検索順位が低下する', isCorrect: true },
        { text: 'サーバーの容量が不足する', isCorrect: false },
        { text: 'SNSでのシェア数が減る', isCorrect: false },
      ],
      tagNames: ['SEO基礎'],
    },
    // --- 内部リンクとSNS ---
    {
      text: '内部リンクの最適化がSEOに効果的である理由として正しいものはどれですか？',
      explanation:
        '内部リンクを最適化することで、検索エンジンのクローラーがサイト内のページを効率的に巡回・インデックスでき、またページ間の関連性を伝えることができます。',
      options: [
        { text: '外部サイトからのアクセスが増えるから', isCorrect: false },
        { text: 'クローラーの巡回効率が上がり、ページ間の関連性を伝えられるから', isCorrect: true },
        { text: '広告収入が増えるから', isCorrect: false },
        { text: 'ドメイン名が変更されるから', isCorrect: false },
      ],
      tagNames: ['テクニカルSEO'],
    },
    // --- 総合：ユーザーファースト ---
    {
      text: '動画で紹介されたSEO対策7項目の根本にある、最も重要な考え方はどれですか？',
      explanation:
        'すべてのSEO対策の基本は「ユーザーファースト」です。ユーザーにとって最も有益で価値のあるコンテンツを提供することが、結果的に検索エンジンからの評価も高めます。',
      options: [
        { text: 'とにかくページ数を増やすこと', isCorrect: false },
        { text: '検索エンジンのアルゴリズムを攻略すること', isCorrect: false },
        { text: 'ユーザーファースト（ユーザーに最も有益なコンテンツを提供すること）', isCorrect: true },
        { text: '広告費を最大限に投入すること', isCorrect: false },
      ],
      tagNames: ['SEO基礎'],
    },
  ])

  // --- Course 1, Chapter 2: コンテンツマーケティング入門 ---
  const c1ch2 = await prisma.chapter.create({
    data: {
      title: 'コンテンツマーケティング入門',
      description: 'コンテンツを活用したマーケティング手法を学びます。',
      order: 2,
      courseId: course1.id,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '【完全講義】コンテンツマーケティングの種類と失敗しない始め方とは？プロ目線で解説',
      type: 'video',
      order: 1,
      chapterId: c1ch2.id,
      youtubeUrl: 'mltP14eieu4',
      videoDurationSeconds: 954,
    },
  })

  await prisma.lesson.create({
    data: {
      title: 'コンテンツマーケティングの種類と失敗しない始め方',
      type: 'text',
      order: 2,
      chapterId: c1ch2.id,
      textContent: `# コンテンツマーケティングの種類と失敗しない始め方

## コンテンツマーケティングとは
コンテンツマーケティングとは、ターゲットユーザーにとって価値のあるコンテンツを継続的に発信し、見込み顧客との信頼関係を構築して、最終的に購買やお問い合わせなどのビジネス成果に繋げるマーケティング手法です。広告のように直接的に売り込むのではなく、有益な情報提供を通じて顧客を引き寄せる「プル型」のアプローチが特徴です。

## コンテンツマーケティングと広告の違い
| | コンテンツマーケティング | Web広告 |
|---|---|---|
| 手法 | 有益な情報を提供して集客 | 費用を払って露出を獲得 |
| 効果の持続性 | 長期的に効果が蓄積される | 出稿を止めると効果ゼロ |
| コスト | 初期は低コスト、長期で費用対効果が高い | 即効性はあるが継続的に費用が発生 |
| 信頼性 | ユーザーからの信頼を獲得しやすい | 広告と認識され敬遠される場合も |

## コンテンツマーケティングの主な種類

### 1. SEOコンテンツ（ブログ・オウンドメディア）
検索エンジン経由で見込み顧客を集客するためのコンテンツです。キーワード選定とユーザーの検索意図を理解した質の高い記事を作成します。長期的に安定した集客が見込めるのが最大のメリットです。

### 2. SNSコンテンツ
X（旧Twitter）、Instagram、YouTube、TikTokなどで発信するコンテンツです。ブランドの認知拡大やファン作りに効果的で、ユーザーとの双方向コミュニケーションが可能です。

### 3. 動画コンテンツ
YouTube等で配信する動画形式のコンテンツです。テキストでは伝わりにくい情報を視覚的に伝えられ、視聴者の理解度と記憶定着率が高い特徴があります。

### 4. メールマガジン（メルマガ）
既存の見込み顧客に対して定期的に情報を配信するコンテンツです。リードナーチャリング（見込み顧客の育成）に最も効果的な手法の一つです。

### 5. ホワイトペーパー・eBook
専門的な知識やノウハウをまとめたダウンロード資料です。リード獲得（メールアドレス等の取得）に直接繋がるため、BtoBマーケティングで特に有効です。

### 6. 事例コンテンツ（ケーススタディ）
実際の顧客の成功事例を紹介するコンテンツです。検討段階の見込み顧客に対して信頼感と具体的な成果のイメージを与えられます。

## 失敗しない始め方 5ステップ

### ステップ1: 目的とKPIを明確にする
「何のためにやるのか」を最初に定義します。集客数、リード獲得数、CVRなど具体的な数値目標を設定しましょう。

### ステップ2: ペルソナを設定する
ターゲットとなる顧客像を具体的に定義します。年齢・職業だけでなく、抱えている課題や情報収集の行動パターンまで明確にします。

### ステップ3: カスタマージャーニーを設計する
ユーザーが商品・サービスを認知してから購入に至るまでの行動プロセスを整理し、各段階に適したコンテンツを設計します。
- **認知段階**: 課題に気づかせる教育的コンテンツ
- **興味・関心段階**: 解決策を提示するコンテンツ
- **比較・検討段階**: 自社の強みをアピールする事例・比較コンテンツ
- **購入・行動段階**: CTA（行動喚起）を含むコンテンツ

### ステップ4: コンテンツカレンダーを作成する
公開スケジュールを計画的に管理し、継続的なコンテンツ発信の仕組みを作ります。

### ステップ5: 効果測定と改善を繰り返す
PV数、滞在時間、CVR等のKPIを定期的に分析し、PDCAサイクルで改善を続けます。

## よくある失敗パターン
- **目的が不明確なまま始める**: 何のためのコンテンツか分からず方向性がブレる
- **すぐに結果を求める**: コンテンツマーケティングは3〜6ヶ月以上の中長期施策
- **量を優先して質を犠牲にする**: 低品質なコンテンツは逆効果
- **ペルソナを設定せずに書く**: 誰にも刺さらないコンテンツになる
- **更新を止めてしまう**: 継続的な発信が信頼構築の鍵`,
    },
  })

  const c1ch2quiz = await prisma.lesson.create({
    data: {
      title: 'コンテンツマーケティングの理解度チェック',
      type: 'quiz',
      order: 3,
      chapterId: c1ch2.id,
    },
  })

  await createQuiz(c1ch2quiz.id, 'コンテンツマーケティングの理解度チェック', [
    // --- コンテンツマーケティングの基本概念 ---
    {
      text: 'コンテンツマーケティングの手法として最も正確な説明はどれですか？',
      explanation:
        'コンテンツマーケティングは有益な情報提供を通じて見込み顧客を引き寄せる「プル型」のアプローチです。広告のように直接売り込むのではなく、信頼関係の構築を重視します。',
      options: [
        { text: '費用を払って広告枠に掲載するプッシュ型手法', isCorrect: false },
        { text: '有益な情報提供で見込み顧客を引き寄せるプル型手法', isCorrect: true },
        { text: 'SNSでフォロワーを増やすことに特化した手法', isCorrect: false },
        { text: '検索エンジンの順位を操作する技術的手法', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    {
      text: 'コンテンツマーケティングがWeb広告と比較して優れている点はどれですか？',
      explanation:
        'コンテンツマーケティングは一度作成したコンテンツが長期的に集客効果を発揮し続けるため、時間が経つほど費用対効果が高まります。広告は出稿を止めると効果がなくなります。',
      options: [
        { text: '即効性が高く、すぐに成果が出る', isCorrect: false },
        { text: 'コンテンツが資産として蓄積され、長期的に効果が持続する', isCorrect: true },
        { text: '初月から必ず売上が上がる', isCorrect: false },
        { text: 'ターゲティングの精度が高い', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    // --- コンテンツの種類 ---
    {
      text: 'BtoBマーケティングでリード獲得（見込み顧客の連絡先取得）に最も直接的に効果があるコンテンツの種類はどれですか？',
      explanation:
        'ホワイトペーパーやeBookはダウンロード時にメールアドレス等の入力を求めるため、リード獲得に直接繋がります。BtoBマーケティングで特に有効なコンテンツ形式です。',
      options: [
        { text: 'SNS投稿', isCorrect: false },
        { text: 'ブログ記事', isCorrect: false },
        { text: 'ホワイトペーパー・eBook', isCorrect: true },
        { text: 'YouTube動画', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    {
      text: '既存の見込み顧客を育成する「リードナーチャリング」に最も効果的なコンテンツ形式はどれですか？',
      explanation:
        'メールマガジンは既存のリスト（見込み顧客）に対して定期的に有益な情報を届けられるため、リードナーチャリング（見込み顧客の育成）に最も適しています。',
      options: [
        { text: 'テレビCM', isCorrect: false },
        { text: 'メールマガジン（メルマガ）', isCorrect: true },
        { text: 'リスティング広告', isCorrect: false },
        { text: '屋外看板', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略', 'コピーライティング'],
    },
    // --- ペルソナとカスタマージャーニー ---
    {
      text: 'ペルソナ設定において、年齢・職業に加えて明確にすべき最も重要な情報はどれですか？',
      explanation:
        'ペルソナ設定では属性情報だけでなく、ターゲットが抱えている課題や情報収集の行動パターンまで明確にすることで、的確なコンテンツ設計が可能になります。',
      options: [
        { text: '好きな食べ物やファッション', isCorrect: false },
        { text: '抱えている課題と情報収集の行動パターン', isCorrect: true },
        { text: '年収の細かい金額', isCorrect: false },
        { text: '使用しているスマートフォンの機種', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    {
      text: 'カスタマージャーニーの「比較・検討段階」にいるユーザーに最も効果的なコンテンツはどれですか？',
      explanation:
        '比較・検討段階のユーザーは複数の選択肢を比較しているため、実際の顧客の成功事例や競合との比較コンテンツが購買意思決定を後押しします。',
      options: [
        { text: '業界の基礎知識を解説するブログ記事', isCorrect: false },
        { text: '自社の会社概要ページ', isCorrect: false },
        { text: '顧客の成功事例や競合との比較コンテンツ', isCorrect: true },
        { text: 'SNSのフォローキャンペーン', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    // --- 失敗しない始め方 ---
    {
      text: 'コンテンツマーケティングを始める際に最初に行うべきことはどれですか？',
      explanation:
        'コンテンツマーケティングでは「何のためにやるのか」という目的とKPI（数値目標）を最初に明確にすることが最も重要です。目的が不明確なまま始めると方向性がブレてしまいます。',
      options: [
        { text: 'とにかくブログ記事を大量に書き始める', isCorrect: false },
        { text: '目的とKPI（数値目標）を明確にする', isCorrect: true },
        { text: 'SNSアカウントを全プラットフォームで開設する', isCorrect: false },
        { text: '競合のコンテンツをコピーする', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    {
      text: 'コンテンツカレンダーを作成する主な目的として正しいものはどれですか？',
      explanation:
        'コンテンツカレンダーはコンテンツの公開スケジュールを計画的に管理し、継続的な発信を仕組み化するためのツールです。場当たり的な運用を防ぎます。',
      options: [
        { text: 'SEOキーワードの一覧を管理するため', isCorrect: false },
        { text: '公開スケジュールを計画し継続的な発信を仕組み化するため', isCorrect: true },
        { text: '広告の予算を月ごとに管理するため', isCorrect: false },
        { text: '競合サイトの更新頻度を記録するため', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略', 'ブログ運営'],
    },
    // --- よくある失敗パターン ---
    {
      text: 'コンテンツマーケティングでよくある失敗パターンとして当てはまらないものはどれですか？',
      explanation:
        'コンテンツマーケティングは3〜6ヶ月以上の中長期施策です。「すぐに結果を求める」「量を優先して質を犠牲にする」「更新を止める」は典型的な失敗パターンですが、ペルソナに基づいた質の高いコンテンツ作りは成功の鍵です。',
      options: [
        { text: 'すぐに結果を求めて1ヶ月で施策を止める', isCorrect: false },
        { text: '量を優先して低品質なコンテンツを大量に作る', isCorrect: false },
        { text: 'ペルソナに基づいて質の高いコンテンツを作る', isCorrect: true },
        { text: '目的を決めずにとりあえず始める', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略', 'ブログ運営'],
    },
    // --- 効果測定 ---
    {
      text: 'コンテンツマーケティングの効果測定で重要なKPIの組み合わせとして最も適切なものはどれですか？',
      explanation:
        'コンテンツマーケティングではPV数（集客力）、滞在時間（コンテンツの質）、CVR（成果への貢献度）を組み合わせて分析し、PDCAサイクルで改善を続けることが重要です。',
      options: [
        { text: 'フォロワー数・いいね数・シェア数のみ', isCorrect: false },
        { text: 'PV数・滞在時間・CVR（コンバージョン率）', isCorrect: true },
        { text: '広告費・CPC・インプレッション数のみ', isCorrect: false },
        { text: '記事の文字数・更新頻度・ページ数のみ', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略', 'ブログ運営'],
    },
  ])

  // --- Course 1, Chapter 3: SNSマーケティングの始め方 ---
  const c1ch3 = await prisma.chapter.create({
    data: {
      title: 'SNSマーケティングの始め方',
      description: 'SNSを活用したマーケティング手法の基礎を学びます。',
      order: 3,
      courseId: course1.id,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '【講義】もはやマーケティングに必須のSNS全体戦略のつくりかた',
      type: 'video',
      order: 1,
      chapterId: c1ch3.id,
      youtubeUrl: 'OHzaZ05uNN8',
      videoDurationSeconds: 3926,
    },
  })

  await prisma.lesson.create({
    data: {
      title: 'SNS全体戦略のつくりかた',
      type: 'text',
      order: 2,
      chapterId: c1ch3.id,
      textContent: `# SNS全体戦略のつくりかた

## なぜSNSマーケティングが必須なのか

現代のマーケティングにおいてSNSは**必須のチャネル**です。消費者の購買行動は「検索」から「SNSでの発見」へと変化しており、特に以下の理由でSNS戦略が重要です。

- **ユーザーの可処分時間の多くがSNSに費やされている**
- **SEOだけでは届かない潜在層にリーチできる**
- **UGC（ユーザー生成コンテンツ）による信頼性の高い口コミが生まれる**
- **広告費をかけずにオーガニックで認知拡大が可能**

## SNS全体戦略の設計ステップ

### ステップ1：目的の明確化
SNS運用の目的を明確にします。目的によって運用方針が大きく変わります。

| 目的 | 主なKPI | 適したSNS |
|------|---------|-----------|
| 認知拡大 | リーチ数・インプレッション | X（Twitter）・TikTok |
| ブランディング | フォロワー数・エンゲージメント率 | Instagram・YouTube |
| 集客・リード獲得 | サイト流入数・CV数 | Instagram・YouTube・LINE |
| ファン化・リピート | エンゲージメント率・UGC数 | Instagram・LINE・X |

### ステップ2：ターゲット設定（ペルソナ設計）
ターゲットを**デモグラフィック（年齢・性別・職業）**と**サイコグラフィック（価値観・ライフスタイル・悩み）**の両面から設定します。

### ステップ3：プラットフォーム選定
各SNSの特徴を理解し、**ターゲットが最も多く利用しているプラットフォーム**を選びます。

#### 主要プラットフォームの特徴

| SNS | MAU（月間利用者） | 特徴 | 強み |
|-----|-------------------|------|------|
| X（Twitter） | 約6,700万 | テキスト中心・拡散力が高い | リアルタイム性・バズ |
| Instagram | 約6,600万 | ビジュアル中心・世界観構築 | ブランディング・EC連携 |
| YouTube | 約7,100万 | 長尺動画・検索エンジン | 教育コンテンツ・SEO |
| TikTok | 約2,800万 | 短尺動画・アルゴリズム推薦 | 若年層リーチ・バイラル |
| LINE | 約9,600万 | メッセージ・1対1コミュニケーション | CRM・リピート促進 |
| Facebook | 約2,600万 | 実名登録・コミュニティ | BtoB・30〜50代リーチ |

### ステップ4：コンテンツ戦略の策定
**「誰に」「何を」「どのように」届けるか**を設計します。

#### コンテンツの4分類
1. **教育コンテンツ**: ノウハウ・ハウツー・Tips → フォロー理由になる
2. **共感コンテンツ**: あるある・体験談・本音 → エンゲージメントが高い
3. **エンタメコンテンツ**: 面白い・驚き・トレンド → 拡散されやすい
4. **販促コンテンツ**: 商品紹介・キャンペーン・口コミ → CVに直結

バランスよく組み合わせ、**販促は全体の2割以下**に抑えることが重要です。

### ステップ5：KPI設定と効果測定
目的に応じた**KGI（最終目標）とKPI（中間指標）**を設定します。

#### 主要KPI指標
- **リーチ数**: 投稿を見たユニークユーザー数
- **インプレッション数**: 投稿が表示された総回数
- **エンゲージメント率**: (いいね+コメント+シェア+保存) ÷ リーチ数 × 100
- **フォロワー増加率**: 一定期間のフォロワー純増数
- **プロフィールアクセス数**: プロフィールページの閲覧数
- **サイト流入数**: SNSからWebサイトへの遷移数
- **UGC数**: ユーザーが自発的に生成したコンテンツの数

## UGC（ユーザー生成コンテンツ）戦略

UGCとは**ユーザーが自発的に作成・投稿するコンテンツ**のことです。

### UGCが重要な理由
- 企業発信の広告より**信頼性が高い**（第三者の口コミ効果）
- **広告費をかけずに**認知拡大ができる
- **コンテンツ制作コスト**を削減できる

### UGCを生み出す仕掛け
1. **ハッシュタグキャンペーン**: 指定ハッシュタグで投稿を促す
2. **フォトスポット設計**: 思わず撮りたくなる体験を提供
3. **リポスト・紹介**: ユーザー投稿を公式アカウントで紹介
4. **レビュー促進**: 購入後のレビュー投稿を依頼

## 複数SNSの連携運用

単一のSNSだけでなく、**複数のSNSを連携させる**ことで効果を最大化します。

### 連携の基本パターン
- **YouTube（教育・深掘り）→ Instagram/TikTok（切り抜き・拡散）→ LINE（CRM・購買）**
- **X（認知・拡散）→ Instagram（世界観・ブランディング）→ EC（購買）**

### 注意点
- 各SNSの特性に合わせて**コンテンツを最適化**する（同じ投稿の使い回しはNG）
- **メインSNSを1つ決め**、そこにリソースを集中する
- サブSNSは**メインへの導線**として活用する

## よくある失敗パターン

1. **目的なく全SNSを運用開始** → リソース分散で全て中途半端に
2. **フォロワー数だけを追いかける** → エンゲージメントが低く売上に繋がらない
3. **販促投稿ばかり** → フォロー解除・ミュートされる
4. **更新が止まる** → アルゴリズムの評価が下がり表示されなくなる
5. **炎上リスクの管理不足** → ブランド毀損に繋がる`,
    },
  })

  const c1ch3quiz = await prisma.lesson.create({
    data: {
      title: 'SNSマーケティングの理解度チェック',
      type: 'quiz',
      order: 3,
      chapterId: c1ch3.id,
    },
  })

  await createQuiz(c1ch3quiz.id, 'SNSマーケティング全体戦略の理解度チェック', [
    // --- SNSマーケティングの重要性（2問） ---
    {
      text: '現代のマーケティングでSNSが必須とされる最も大きな理由はどれですか？',
      explanation:
        '消費者の購買行動が「検索」から「SNSでの発見」へと変化しており、ユーザーの可処分時間の多くがSNSに費やされています。SEOだけでは届かない潜在層にリーチできる点がSNSの最大の強みです。',
      options: [
        { text: 'SNS広告は他の広告より安いから', isCorrect: false },
        { text: '消費者の行動がSNS中心に変化し、潜在層にリーチできるから', isCorrect: true },
        { text: '法律でSNS運用が義務化されたから', isCorrect: false },
        { text: 'SEOが完全に無効になったから', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎'],
    },
    {
      text: 'UGC（ユーザー生成コンテンツ）が企業のSNSマーケティングで重視される理由として最も適切なものはどれですか？',
      explanation:
        'UGCは第三者であるユーザーが自発的に作成するコンテンツであるため、企業発信の広告より信頼性が高く、広告費をかけずに認知拡大ができます。',
      options: [
        { text: '企業が制作するより品質が高いから', isCorrect: false },
        { text: '法律で一定量のUGCが義務付けられているから', isCorrect: false },
        { text: '第三者の口コミとして信頼性が高く、広告費をかけずに認知拡大できるから', isCorrect: true },
        { text: 'UGCだけで商品が自動的に売れるから', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎', 'エンゲージメント分析'],
    },
    // --- SNS全体戦略の設計（3問） ---
    {
      text: 'SNS全体戦略を設計する際、最初に行うべきステップはどれですか？',
      explanation:
        'SNS運用は目的によって運用方針が大きく変わります。認知拡大なのか、集客なのか、ファン化なのかを最初に明確にすることが全体戦略の出発点です。',
      options: [
        { text: 'すべてのSNSアカウントを同時に開設する', isCorrect: false },
        { text: 'インフルエンサーに依頼する', isCorrect: false },
        { text: 'SNS運用の目的を明確にする', isCorrect: true },
        { text: 'バズりそうなコンテンツを投稿する', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎'],
    },
    {
      text: 'SNSマーケティングにおけるターゲット設定で、デモグラフィックとサイコグラフィックの両方を設定する理由として正しいものはどれですか？',
      explanation:
        'デモグラフィック（年齢・性別・職業）だけでは行動の動機が分からないため、サイコグラフィック（価値観・ライフスタイル・悩み）も合わせて設定することで、響くコンテンツを設計できます。',
      options: [
        { text: '広告審査に両方のデータが必要だから', isCorrect: false },
        { text: '年齢・性別だけでは行動の動機が分からず、響くコンテンツを設計できないから', isCorrect: true },
        { text: 'サイコグラフィックがないとSNSアカウントを開設できないから', isCorrect: false },
        { text: 'デモグラフィックだけの方が精度は高いが、念のため補足するから', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎'],
    },
    {
      text: '複数SNSを運用する際の基本方針として最も適切なものはどれですか？',
      explanation:
        'リソースが限られる中で効果を最大化するには、メインSNSを1つ決めてリソースを集中し、サブSNSはメインへの導線として活用するのが基本です。全SNSに同じ投稿を使い回すのはNGです。',
      options: [
        { text: 'すべてのSNSに同じコンテンツを同時に投稿する', isCorrect: false },
        { text: 'メインSNSを1つ決めてリソースを集中し、サブSNSは導線として活用する', isCorrect: true },
        { text: 'フォロワーが最も多いSNSだけに絞る', isCorrect: false },
        { text: '新しいSNSが出るたびにすべて導入する', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎'],
    },
    // --- プラットフォーム特性（3問） ---
    {
      text: '「認知拡大」を目的とする場合に最も適したSNSプラットフォームの組み合わせはどれですか？',
      explanation:
        'X（Twitter）はリアルタイム性と拡散力が高く、TikTokはアルゴリズム推薦でフォロワー外にもリーチしやすいため、認知拡大に最も適しています。',
      options: [
        { text: 'LINE と Facebook', isCorrect: false },
        { text: 'X（Twitter）と TikTok', isCorrect: true },
        { text: 'Instagram と LINE', isCorrect: false },
        { text: 'YouTube と Facebook', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎'],
    },
    {
      text: 'Instagramの強みとして最も適切なものはどれですか？',
      explanation:
        'Instagramはビジュアル中心のプラットフォームで、統一感のある世界観を構築してブランディングに活用でき、ショッピング機能によるEC連携も強みです。',
      options: [
        { text: 'テキスト中心のリアルタイムな情報拡散', isCorrect: false },
        { text: '長尺動画による詳細な教育コンテンツ', isCorrect: false },
        { text: 'ビジュアルによるブランディングとEC連携', isCorrect: true },
        { text: '1対1のメッセージによるCRM', isCorrect: false },
      ],
      tagNames: ['Instagram運用'],
    },
    {
      text: 'LINEがマーケティングで特に強い領域はどれですか？',
      explanation:
        'LINEはMAU約9,600万人と日本最大のプラットフォームで、1対1のメッセージ配信による顧客関係管理（CRM）やリピート促進に特に優れています。',
      options: [
        { text: 'バズによる爆発的な認知拡大', isCorrect: false },
        { text: 'ビジュアルによるブランディング', isCorrect: false },
        { text: '短尺動画による若年層へのリーチ', isCorrect: false },
        { text: 'CRM（顧客関係管理）とリピート促進', isCorrect: true },
      ],
      tagNames: ['SNS運用基礎'],
    },
    // --- コンテンツ戦略（3問） ---
    {
      text: 'SNSのコンテンツ戦略における「4分類」に含まれないものはどれですか？',
      explanation:
        'SNSコンテンツは「教育コンテンツ」「共感コンテンツ」「エンタメコンテンツ」「販促コンテンツ」の4つに分類されます。競合分析コンテンツはこの4分類には含まれません。',
      options: [
        { text: '教育コンテンツ（ノウハウ・Tips）', isCorrect: false },
        { text: '共感コンテンツ（あるある・体験談）', isCorrect: false },
        { text: '競合分析コンテンツ（他社比較・批評）', isCorrect: true },
        { text: '販促コンテンツ（商品紹介・キャンペーン）', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎', 'コンテンツ戦略'],
    },
    {
      text: 'SNS投稿における販促コンテンツ（商品紹介・キャンペーン）の適切な割合はどの程度ですか？',
      explanation:
        '販促コンテンツばかりだとフォロー解除やミュートに繋がるため、全体の2割以下に抑え、教育・共感・エンタメコンテンツをバランスよく組み合わせることが重要です。',
      options: [
        { text: '全体の8割以上', isCorrect: false },
        { text: '全体の5割程度', isCorrect: false },
        { text: '全体の2割以下', isCorrect: true },
        { text: '販促コンテンツは一切投稿しない', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎', 'コンテンツ戦略'],
    },
    {
      text: 'SNSで「フォローする理由」を作るために最も効果的なコンテンツの種類はどれですか？',
      explanation:
        '教育コンテンツ（ノウハウ・ハウツー・Tips）はユーザーにとって「このアカウントをフォローしておくと有益な情報が得られる」という理由になるため、フォローの動機付けに最も効果的です。',
      options: [
        { text: '販促コンテンツ（割引クーポン・セール情報）', isCorrect: false },
        { text: '教育コンテンツ（ノウハウ・ハウツー・Tips）', isCorrect: true },
        { text: '会社の沿革や経営理念の紹介', isCorrect: false },
        { text: '社員の日常風景の投稿', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    // --- KPI・効果測定（2問） ---
    {
      text: 'SNSの分析指標で「リーチ」と「インプレッション」の違いとして正しいものはどれですか？',
      explanation:
        'リーチは投稿を見たユニークユーザー数、インプレッションは投稿が表示された総回数です。同一ユーザーが3回見た場合、リーチは1、インプレッションは3とカウントされます。',
      options: [
        { text: '両方とも同じ意味である', isCorrect: false },
        { text: 'リーチはユニークユーザー数、インプレッションは表示総回数', isCorrect: true },
        { text: 'リーチは表示回数、インプレッションはクリック数', isCorrect: false },
        { text: 'リーチは国内のみ、インプレッションは海外を含む', isCorrect: false },
      ],
      tagNames: ['エンゲージメント分析'],
    },
    {
      text: 'エンゲージメント率の計算式として正しいものはどれですか？',
      explanation:
        'エンゲージメント率は（いいね＋コメント＋シェア＋保存）の合計をリーチ数で割って100をかけた値です。投稿に対するユーザーの反応度合いを測る重要な指標です。',
      options: [
        { text: 'フォロワー数 ÷ 投稿数 × 100', isCorrect: false },
        { text: '(いいね+コメント+シェア+保存) ÷ リーチ数 × 100', isCorrect: true },
        { text: 'インプレッション数 ÷ フォロワー数 × 100', isCorrect: false },
        { text: 'クリック数 ÷ 表示回数 × 100', isCorrect: false },
      ],
      tagNames: ['エンゲージメント分析'],
    },
    // --- UGC戦略（1問） ---
    {
      text: 'UGC（ユーザー生成コンテンツ）を生み出すための施策として適切でないものはどれですか？',
      explanation:
        'UGCを生み出す施策としてはハッシュタグキャンペーン、フォトスポット設計、ユーザー投稿のリポスト、レビュー促進などがあります。企業がユーザーになりすまして投稿するのはステルスマーケティングであり、不適切です。',
      options: [
        { text: '指定ハッシュタグでの投稿キャンペーンを実施する', isCorrect: false },
        { text: 'ユーザーの投稿を公式アカウントでリポスト・紹介する', isCorrect: false },
        { text: '企業がユーザーになりすまして口コミを投稿する', isCorrect: true },
        { text: '思わず写真を撮りたくなるフォトスポットを設計する', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎', 'エンゲージメント分析'],
    },
    // --- よくある失敗パターン（1問） ---
    {
      text: 'SNSマーケティングのよくある失敗パターンとして当てはまらないものはどれですか？',
      explanation:
        '「目的なく全SNSを運用開始」「フォロワー数だけを追う」「販促投稿ばかり」「更新が止まる」は典型的な失敗パターンです。メインSNSにリソースを集中するのは成功の基本戦略です。',
      options: [
        { text: '目的を決めずに全SNSを同時に運用開始する', isCorrect: false },
        { text: 'フォロワー数だけを追いかけてエンゲージメントを無視する', isCorrect: false },
        { text: 'メインSNSを1つ決めてリソースを集中させる', isCorrect: true },
        { text: '販促投稿ばかりでフォロワーにミュートされる', isCorrect: false },
      ],
      tagNames: ['SNS運用基礎'],
    },
  ])

  console.log('Created Course 1: Webマーケティング基礎')

  // ============================================================
  // Course 2: AI時代のマーケティング戦略
  // ============================================================
  const course2 = await prisma.course.create({
    data: {
      title: 'AI時代のマーケティング戦略',
      description:
        'ChatGPTをはじめとするAIツールをマーケティングに活用する方法を学びます。プロンプトエンジニアリングからデータ分析、コンテンツ生成まで実践的に解説します。',
      category: 'AI活用',
      difficulty: 'intermediate',
      isPublished: true,
    },
  })

  // --- Course 2, Chapter 1: ChatGPTをマーケティングに活用する ---
  const c2ch1 = await prisma.chapter.create({
    data: {
      title: 'ChatGPTをマーケティングに活用する',
      description: 'ChatGPTの基本的な使い方とマーケティングへの応用を学びます。',
      order: 1,
      courseId: course2.id,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '【今さら聞けないChatGPT】GPT-5の使用感／AI活用のプロに聞くビジネス活用術【PIVOT TALK】',
      type: 'video',
      order: 1,
      chapterId: c2ch1.id,
      youtubeUrl: 'hIUpa_kF2jM',
      videoDurationSeconds: 3070,
    },
  })

  await prisma.lesson.create({
    data: {
      title: 'ChatGPTビジネス活用術 & プロンプト指示の極意',
      type: 'text',
      order: 2,
      chapterId: c2ch1.id,
      textContent: `# ChatGPTビジネス活用術 & プロンプト指示の極意

## AI活用はもはや「マナー」の時代
ビジネスシーンにおいて、AIを使いこなすことは特別なスキルではなく、メールや表計算と同様の基本的なビジネスマナーになりつつあります。AI活用のプロ・usutaku氏によると、「AIを使わないこと」自体がビジネスにおける機会損失になる時代です。

## GPT-5の進化ポイント
GPT-5はGPT-4と比較して以下の点が大幅に進化しています。
- **推論能力の向上**: 複雑な論理的思考やステップバイステップの分析がより正確に
- **マルチモーダル対応の強化**: テキスト・画像・音声をシームレスに扱える
- **コンテキスト理解の深化**: 長文の文脈をより正確に把握
- **出力の自然さ**: より人間に近い自然な文章生成

## プロンプト指示の5つの極意

### 1. 役割（ロール）を明確に指定する
AIに「あなたは○○の専門家です」と役割を与えることで、回答の質と専門性が大幅に向上します。

**例**: 「あなたは10年以上の経験を持つWebマーケティングコンサルタントです。中小企業向けのSEO戦略を提案してください。」

### 2. 具体的なコンテキストを与える
背景情報、ターゲット、目的を明確に伝えることで、的確な回答が得られます。

**例**: 「私は飲食店を経営しています。ターゲットは20〜30代の女性で、Instagram経由の集客を増やしたいです。」

### 3. 出力フォーマットを指定する
箇条書き、表形式、ステップバイステップなど、欲しい形式を具体的に指示します。

### 4. 制約条件を設定する
文字数制限、使用する言語レベル、避けるべき表現などの制約を明示します。

### 5. フィードバックループを活用する
一度の指示で完璧を求めず、AIの出力を見てから追加の指示で改善していく反復的なアプローチが効果的です。

## Deep Researchの活用法
ChatGPTのDeep Research機能は、複数のWebソースから情報を収集・分析してレポートを作成してくれる機能です。
- **営業活動**: 商談前の企業リサーチや業界分析
- **市場調査**: 競合調査や市場トレンドの把握
- **提案書作成**: データに基づいた根拠のある提案資料の作成

## GPTs（カスタムGPT）の活用
GPTsを使えば、特定の業務に特化したAIアシスタントを自分で作成できます。
- **社内FAQ対応GPT**: よくある質問に自動回答
- **メール下書きGPT**: 定型的なビジネスメールを効率的に作成
- **データ分析GPT**: 売上データの分析と可視化を自動化
- **SNS投稿作成GPT**: ブランドのトーンに合った投稿文を生成

## まとめ：AI活用で生産性を最大化する
AIは万能ではありませんが、適切に活用すれば業務効率を大幅に向上させます。大切なのは「AIに任せること」と「人間が判断すること」を適切に使い分けることです。`,
    },
  })

  const c2ch1quiz = await prisma.lesson.create({
    data: {
      title: 'ChatGPT活用の理解度チェック',
      type: 'quiz',
      order: 3,
      chapterId: c2ch1.id,
    },
  })

  await createQuiz(c2ch1quiz.id, 'ChatGPT活用の理解度チェック', [
    // --- AI活用の基本概念 ---
    {
      text: '動画で紹介された「AI活用はマナーの時代」とはどういう意味ですか？',
      explanation:
        'ビジネスにおいてAIを使いこなすことは特別なスキルではなく、メールや表計算と同様の基本的なビジネスマナーになりつつあるという意味です。',
      options: [
        { text: 'AIを使う際は礼儀正しい言葉遣いをすべきという意味', isCorrect: false },
        { text: 'AI活用はビジネスの基本スキル・常識になったという意味', isCorrect: true },
        { text: 'AIの使用にはマナー講座の受講が必須という意味', isCorrect: false },
        { text: 'AIを使わない方がマナーとして正しいという意味', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用'],
    },
    {
      text: 'ビジネスでAIを活用しないことのリスクとして最も適切なものはどれですか？',
      explanation:
        'AI活用が一般化した現在、AIを使わないこと自体が業務効率や生産性における機会損失につながります。',
      options: [
        { text: '法的なペナルティを受ける', isCorrect: false },
        { text: '業務効率や生産性における機会損失が発生する', isCorrect: true },
        { text: '会社のセキュリティが向上する', isCorrect: false },
        { text: '特にリスクはない', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用'],
    },
    // --- GPT-5の進化 ---
    {
      text: 'GPT-5がGPT-4と比較して大幅に進化した点として正しいものはどれですか？',
      explanation:
        'GPT-5は推論能力の向上、マルチモーダル対応の強化、コンテキスト理解の深化、出力の自然さなど、多方面で進化しています。',
      options: [
        { text: 'テキストのみに特化して処理速度が10倍になった', isCorrect: false },
        { text: '推論能力・マルチモーダル対応・コンテキスト理解が大幅に向上した', isCorrect: true },
        { text: '日本語のみに対応するようになった', isCorrect: false },
        { text: 'インターネット接続なしでも動作するようになった', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用'],
    },
    {
      text: 'GPT-5の「マルチモーダル対応」とは何を意味しますか？',
      explanation:
        'マルチモーダル対応とは、テキスト・画像・音声など複数の種類の入出力をシームレスに扱える能力のことです。',
      options: [
        { text: '複数の言語に対応できること', isCorrect: false },
        { text: '複数のユーザーが同時に使用できること', isCorrect: false },
        { text: 'テキスト・画像・音声など複数の形式を扱えること', isCorrect: true },
        { text: '複数のデバイスで同期できること', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用'],
    },
    // --- プロンプト指示の極意 ---
    {
      text: 'プロンプトに「あなたは○○の専門家です」と役割を指定する手法は何と呼ばれますか？',
      explanation:
        'ロールプロンプティングはAIに特定の役割や専門性を設定する手法で、回答の質と専門性が大幅に向上します。',
      options: [
        { text: 'チェーンプロンプティング', isCorrect: false },
        { text: 'ゼロショットプロンプティング', isCorrect: false },
        { text: 'ロールプロンプティング', isCorrect: true },
        { text: 'フューショットプロンプティング', isCorrect: false },
      ],
      tagNames: ['プロンプトエンジニアリング'],
    },
    {
      text: 'プロンプトで「具体的なコンテキストを与える」とは、どのような情報を含めることですか？',
      explanation:
        'コンテキストとは、背景情報・ターゲット・目的など、AIが適切な回答を生成するために必要な前提情報のことです。',
      options: [
        { text: 'AIのバージョン情報を記載すること', isCorrect: false },
        { text: '背景情報・ターゲット・目的を明確に伝えること', isCorrect: true },
        { text: 'できるだけ長い文章を書くこと', isCorrect: false },
        { text: 'プログラミングコードを含めること', isCorrect: false },
      ],
      tagNames: ['プロンプトエンジニアリング'],
    },
    {
      text: 'プロンプトで出力フォーマットを指定する理由として最も適切なものはどれですか？',
      explanation:
        '出力フォーマット（箇条書き、表形式、ステップバイステップなど）を指定することで、自分が使いやすい形式で回答を受け取ることができます。',
      options: [
        { text: 'AIの処理速度が向上するから', isCorrect: false },
        { text: '自分が活用しやすい形式で回答を得られるから', isCorrect: true },
        { text: 'AIのトレーニングデータが改善されるから', isCorrect: false },
        { text: '文字数が自動的に削減されるから', isCorrect: false },
      ],
      tagNames: ['プロンプトエンジニアリング'],
    },
    {
      text: 'プロンプトの「制約条件の設定」の具体例として適切なものはどれですか？',
      explanation:
        '制約条件の設定とは、文字数制限・言語レベル・避けるべき表現など、出力に対する具体的な制約を明示することです。',
      options: [
        { text: '「何でもいいので自由に書いてください」と指示する', isCorrect: false },
        { text: '「300文字以内で、中学生にもわかる言葉で説明してください」と指示する', isCorrect: true },
        { text: '「AIであることを隠して回答してください」と指示する', isCorrect: false },
        { text: '「前回の回答を忘れてください」と指示する', isCorrect: false },
      ],
      tagNames: ['プロンプトエンジニアリング'],
    },
    {
      text: 'プロンプト指示において「フィードバックループ」を活用するとは、どういうアプローチですか？',
      explanation:
        'フィードバックループとは、一度で完璧を求めず、AIの出力を見てから追加の指示で改善していく反復的なアプローチのことです。',
      options: [
        { text: '同じプロンプトを何度も繰り返し送信すること', isCorrect: false },
        { text: 'AIの出力を見て追加指示で改善する反復的なアプローチ', isCorrect: true },
        { text: 'AIにフィードバックの評価点数をつけること', isCorrect: false },
        { text: 'AIの回答を他のAIに評価させること', isCorrect: false },
      ],
      tagNames: ['プロンプトエンジニアリング'],
    },
    // --- Deep Research ---
    {
      text: 'ChatGPTの「Deep Research」機能の特徴として正しいものはどれですか？',
      explanation:
        'Deep Researchは複数のWebソースから情報を収集・分析してレポートを作成してくれる機能です。営業の企業リサーチや市場調査に活用できます。',
      options: [
        { text: 'オフラインでAIモデルを学習させる機能', isCorrect: false },
        { text: '複数のWebソースから情報を収集・分析してレポートを作成する機能', isCorrect: true },
        { text: 'プログラミングコードを自動実行する機能', isCorrect: false },
        { text: '過去の会話履歴を検索する機能', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用'],
    },
    {
      text: 'Deep Researchの営業活動での活用法として最も適切なものはどれですか？',
      explanation:
        'Deep Researchは商談前の企業リサーチや業界分析に活用でき、データに基づいた提案が可能になります。',
      options: [
        { text: '営業トークの録音と文字起こし', isCorrect: false },
        { text: '商談前の企業リサーチや業界分析', isCorrect: true },
        { text: '見積書の自動作成と送信', isCorrect: false },
        { text: '顧客の個人情報の収集', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用', 'AIデータ分析'],
    },
    // --- GPTs（カスタムGPT） ---
    {
      text: 'GPTs（カスタムGPT）とは何ですか？',
      explanation:
        'GPTsは特定の業務に特化したAIアシスタントをプログラミング不要で自分で作成できる機能です。社内FAQ、メール作成、データ分析など様々な用途に活用できます。',
      options: [
        { text: 'GPTの過去バージョンのこと', isCorrect: false },
        { text: '特定の業務に特化したAIアシスタントを自作できる機能', isCorrect: true },
        { text: 'GPTのAPIキーのこと', isCorrect: false },
        { text: 'GPTの有料プラン限定のチャット機能', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用'],
    },
    {
      text: 'GPTsの活用例として適切でないものはどれですか？',
      explanation:
        'GPTsは社内FAQ対応、メール下書き、データ分析、SNS投稿作成などに活用できますが、物理的な配送業務の代行はAIの範囲外です。',
      options: [
        { text: '社内FAQ対応GPTでよくある質問に自動回答', isCorrect: false },
        { text: 'メール下書きGPTでビジネスメールを効率的に作成', isCorrect: false },
        { text: 'SNS投稿作成GPTでブランドに合った投稿文を生成', isCorrect: false },
        { text: '配送GPTで商品を物理的に届ける', isCorrect: true },
      ],
      tagNames: ['ChatGPT活用'],
    },
    // --- AI活用の注意点と総合 ---
    {
      text: 'AIをビジネスで活用する際、最も重要な使い分けの考え方はどれですか？',
      explanation:
        'AIは万能ではないため、「AIに任せること」と「人間が判断すること」を適切に使い分けることが最も重要です。',
      options: [
        { text: 'すべての業務をAIに完全に任せる', isCorrect: false },
        { text: 'AIは一切使わず従来通りの方法で進める', isCorrect: false },
        { text: 'AIに任せることと人間が判断することを適切に使い分ける', isCorrect: true },
        { text: 'AIの出力結果をそのまま最終成果物として提出する', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用'],
    },
    {
      text: 'AIの出力に対してファクトチェックが必要な理由として最も正確なものはどれですか？',
      explanation:
        'AIにはハルシネーション（事実と異なる情報をもっともらしく生成する現象）のリスクがあるため、人間による事実確認が不可欠です。',
      options: [
        { text: 'AIは常に間違った情報を出力するから', isCorrect: false },
        { text: 'ハルシネーション（事実と異なる情報の生成）のリスクがあるから', isCorrect: true },
        { text: 'AIの回答は法的に無効だから', isCorrect: false },
        { text: 'ファクトチェックをするとAIの精度が向上するから', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用', 'プロンプトエンジニアリング'],
    },
  ])

  // --- Course 2, Chapter 2: AIを使ったデータ分析 ---
  const c2ch2 = await prisma.chapter.create({
    data: {
      title: 'AIを使ったデータ分析',
      description: 'AIツールを使ってマーケティングデータを分析する方法を学びます。',
      order: 2,
      courseId: course2.id,
    },
  })

  await prisma.lesson.create({
    data: {
      title: 'データ分析業務を生成AIを活用して一気に効率化する方法をAIのプロが徹底解説',
      type: 'video',
      order: 1,
      chapterId: c2ch2.id,
      youtubeUrl: 's-Zay3ASRvg',
      videoDurationSeconds: 1009,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '生成AIを活用したデータ分析業務の効率化',
      type: 'text',
      order: 2,
      chapterId: c2ch2.id,
      textContent: `# 生成AIを活用したデータ分析業務の効率化

## なぜデータ分析に生成AIを活用すべきか

従来のデータ分析は、Excel操作やSQL、Pythonなどの専門スキルが必要でしたが、生成AIの登場により**自然言語（日本語）で指示するだけ**でデータ分析が可能になりました。

### 生成AI活用のメリット
- **専門スキル不要**: プログラミングやSQL不要で分析できる
- **圧倒的な時短**: 数時間かかっていた分析が数分で完了
- **分析の民主化**: データ部門以外のメンバーも分析可能に
- **仮説の高速検証**: 思いついた分析をすぐに試せる

## データ分析の基本ステップ（生成AI活用版）

### ステップ1：データの準備と取り込み
CSVやExcelファイルをChatGPT（Advanced Data Analysis）やGeminiなどに読み込ませます。

**ポイント:**
- ファイルをアップロードする前に**データの概要を把握**しておく
- **機密情報・個人情報が含まれていないか**確認する（AIに送信するため）
- 列名（ヘッダー）が日本語でも英語でもAIは認識可能

### ステップ2：データの概要把握
まずAIに「このデータの概要を教えてください」と指示し、データの全体像を把握します。

**AIが自動で行ってくれること:**
- データの行数・列数の確認
- 各列のデータ型（数値・文字列・日付）の判定
- 欠損値（空白データ）の検出
- 基本統計量（平均値・中央値・最大値・最小値）の算出

### ステップ3：データクレンジング
AIに「データの異常値や重複を確認・修正してください」と指示します。

**よくあるクレンジング作業:**
- 重複データの削除
- 欠損値の処理（削除 or 補完）
- 表記揺れの統一（「東京都」と「東京」など）
- 異常値（外れ値）の確認と対処

### ステップ4：分析と可視化
目的に応じた分析をAIに指示し、グラフや表で可視化します。

**プロンプト例:**
- 「月別の売上推移を折れ線グラフで表示してください」
- 「商品カテゴリ別の売上構成比を円グラフにしてください」
- 「売上と広告費の相関関係を散布図で示してください」
- 「前年同月比の成長率を計算して表にしてください」

### ステップ5：インサイト抽出と施策提案
分析結果をもとにAIに「この分析から読み取れるインサイトと改善施策を提案してください」と指示します。

## 生成AIで活用できるデータ分析手法

| 分析手法 | 用途 | プロンプト例 |
|----------|------|-------------|
| トレンド分析 | 時系列の変動傾向を把握 | 「月次売上の推移を分析して」 |
| セグメント分析 | 顧客や商品をグループ分け | 「顧客を購買金額で3グループに分けて」 |
| 相関分析 | 2つの変数の関連性を調べる | 「広告費と売上の相関を分析して」 |
| ABC分析 | 重要度でランク付け | 「売上上位20%の商品を特定して」 |
| コホート分析 | 時期別の顧客行動を追跡 | 「月別の新規顧客のリピート率を分析して」 |
| RFM分析 | 顧客の購買行動を3軸で評価 | 「最終購入日・購入頻度・購入金額で顧客を分類して」 |

## 生成AIでデータ分析する際の注意点

### 1. 機密情報・個人情報の取り扱い
- **個人を特定できる情報**はAIに送信しない
- 社内の**機密データ**は利用規約を確認してから使用
- 必要に応じて**データの匿名化・マスキング**を行う

### 2. AIの出力結果を鵜呑みにしない
- AIは**計算ミスやハルシネーション**を起こす可能性がある
- 重要な分析結果は**必ず人間が検算・検証**する
- 特に金額や割合の計算は**元データと照合**する

### 3. 分析の目的を明確にする
- 「とりあえず分析して」ではなく**具体的な目的**を伝える
- **仮説を持って分析に臨む**と精度の高い結果が得られる

### 4. プロンプトの精度が結果を左右する
- **具体的な指示**を出すほど精度の高い分析が得られる
- 一度に多くの分析を依頼せず、**段階的に進める**
- 期待する**出力形式（表・グラフ・箇条書き）を指定**する

## 実務での活用シーン

1. **売上レポート作成**: 月次・週次の売上データを自動集計・レポート化
2. **広告効果分析**: 広告チャネル別のCPA・ROAS分析
3. **顧客分析**: 購買データからセグメント分析・RFM分析
4. **Webアクセス解析**: GA4データの分析・改善提案
5. **競合分析**: 公開データを元にした市場ポジション分析
6. **アンケート分析**: フリーテキスト回答の分類・感情分析`,
    },
  })

  const c2ch2quiz = await prisma.lesson.create({
    data: {
      title: 'AIデータ分析の理解度チェック',
      type: 'quiz',
      order: 3,
      chapterId: c2ch2.id,
    },
  })

  await createQuiz(c2ch2quiz.id, '生成AIデータ分析の理解度チェック', [
    // --- 生成AI×データ分析の基本（2問） ---
    {
      text: '生成AIをデータ分析に活用する最大のメリットはどれですか？',
      explanation:
        '生成AIの登場により、プログラミングやSQLなどの専門スキルがなくても自然言語（日本語）で指示するだけでデータ分析が可能になり、分析業務が民主化されました。',
      options: [
        { text: 'AIが自動でデータを収集してくれる', isCorrect: false },
        { text: '専門スキル不要で自然言語による指示だけで分析できる', isCorrect: true },
        { text: 'AIの分析結果は100%正確である', isCorrect: false },
        { text: 'データの保管コストが不要になる', isCorrect: false },
      ],
      tagNames: ['AIデータ分析'],
    },
    {
      text: '生成AIによるデータ分析で「分析の民主化」とはどういう意味ですか？',
      explanation:
        '分析の民主化とは、これまでデータサイエンティストやエンジニアなどの専門家しかできなかった分析を、マーケティング担当者や営業など非技術者でもAIを使って実行できるようになることです。',
      options: [
        { text: 'データを全社員に公開すること', isCorrect: false },
        { text: '専門家以外のメンバーもAIを使って分析を実行できるようになること', isCorrect: true },
        { text: 'AIが自動で全社員にレポートを配信すること', isCorrect: false },
        { text: '分析結果を多数決で決めること', isCorrect: false },
      ],
      tagNames: ['AIデータ分析'],
    },
    // --- データ分析のステップ（3問） ---
    {
      text: '生成AIにデータファイルをアップロードする前に必ず確認すべきことはどれですか？',
      explanation:
        '生成AIにデータを送信する際は、個人を特定できる情報や機密データが含まれていないかを事前に確認する必要があります。必要に応じてデータの匿名化・マスキングを行います。',
      options: [
        { text: 'ファイルサイズが1MB以下であること', isCorrect: false },
        { text: '機密情報や個人情報が含まれていないか', isCorrect: true },
        { text: 'データが英語で記載されていること', isCorrect: false },
        { text: 'ファイル形式がPDFであること', isCorrect: false },
      ],
      tagNames: ['AIデータ分析'],
    },
    {
      text: 'データクレンジングで行う作業として適切でないものはどれですか？',
      explanation:
        'データクレンジングは重複データの削除、欠損値の処理、表記揺れの統一、異常値の確認と対処を行います。データの改ざんや捏造はクレンジングではなく不正行為です。',
      options: [
        { text: '重複データの削除', isCorrect: false },
        { text: '欠損値（空白データ）の処理', isCorrect: false },
        { text: '都合の悪いデータの削除や数値の改ざん', isCorrect: true },
        { text: '表記揺れの統一（「東京都」と「東京」など）', isCorrect: false },
      ],
      tagNames: ['AIデータ分析'],
    },
    {
      text: 'AIに分析を指示する際のプロンプトとして最も効果的なものはどれですか？',
      explanation:
        '具体的な分析内容と出力形式（グラフの種類や表形式など）を指定することで、AIは意図に沿った精度の高い分析結果を出力します。曖昧な指示では期待する結果が得られません。',
      options: [
        { text: '「データを分析してください」', isCorrect: false },
        { text: '「何かインサイトを見つけてください」', isCorrect: false },
        { text: '「月別の売上推移を折れ線グラフで表示し、前年同月比も併記してください」', isCorrect: true },
        { text: '「すべてのグラフを一度に作ってください」', isCorrect: false },
      ],
      tagNames: ['AIデータ分析', 'プロンプトエンジニアリング'],
    },
    // --- 分析手法（2問） ---
    {
      text: 'RFM分析で評価する3つの軸の組み合わせとして正しいものはどれですか？',
      explanation:
        'RFM分析はRecency（最終購入日）、Frequency（購入頻度）、Monetary（購入金額）の3軸で顧客を評価・分類する手法です。優良顧客の特定やセグメント別施策に活用されます。',
      options: [
        { text: 'Reach（到達数）・Frequency（頻度）・Media（媒体）', isCorrect: false },
        { text: 'Recency（最終購入日）・Frequency（購入頻度）・Monetary（購入金額）', isCorrect: true },
        { text: 'Revenue（売上）・Feedback（評価）・Market（市場）', isCorrect: false },
        { text: 'Return（リターン）・Flow（流入）・Measure（計測）', isCorrect: false },
      ],
      tagNames: ['AIデータ分析', 'Googleアナリティクス'],
    },
    {
      text: 'ABC分析の目的として最も適切なものはどれですか？',
      explanation:
        'ABC分析は売上や利益への貢献度で商品や顧客をA（重要）・B（中程度）・C（低い）にランク分けし、重点管理すべき対象を特定する手法です。パレートの法則（80:20の法則）に基づいています。',
      options: [
        { text: 'アルファベット順に顧客を整理する', isCorrect: false },
        { text: '売上への貢献度で重要度をランク付けし、重点管理対象を特定する', isCorrect: true },
        { text: 'A/Bテストの結果を評価する', isCorrect: false },
        { text: 'データの異常値を検出する', isCorrect: false },
      ],
      tagNames: ['AIデータ分析'],
    },
    // --- 注意点と実務活用（3問） ---
    {
      text: '生成AIのデータ分析結果に対して人間が行うべきこととして最も重要なものはどれですか？',
      explanation:
        'AIはハルシネーション（事実と異なる情報の生成）や計算ミスを起こす可能性があるため、特に金額や割合の計算は元データと照合し、必ず人間が検算・検証する必要があります。',
      options: [
        { text: 'AIの出力結果をそのまま報告書に使用する', isCorrect: false },
        { text: '分析結果を必ず検算・検証し、元データと照合する', isCorrect: true },
        { text: 'AIの分析結果を別のAIに再度分析させる', isCorrect: false },
        { text: '結果が気に入らなければ何度も再実行する', isCorrect: false },
      ],
      tagNames: ['AIデータ分析'],
    },
    {
      text: 'データ分析の目的設定について正しいアプローチはどれですか？',
      explanation:
        'データ分析は仮説を持って臨むことで精度の高い結果が得られます。「とりあえず分析して」では的外れな結果になりがちです。目的を明確にし、段階的に進めることが重要です。',
      options: [
        { text: '「何か面白いことを見つけてください」と指示する', isCorrect: false },
        { text: '仮説を持ち、具体的な目的を明確にしてから分析を始める', isCorrect: true },
        { text: 'できるだけ多くの分析を一度にまとめて依頼する', isCorrect: false },
        { text: 'データ量が多ければ自動的に良い分析結果が出る', isCorrect: false },
      ],
      tagNames: ['AIデータ分析', 'KPI設計'],
    },
    {
      text: '生成AIを活用した実務でのデータ分析活用シーンとして適切でないものはどれですか？',
      explanation:
        '生成AIは売上レポート作成、広告効果分析、顧客分析、アンケート分析などに活用できますが、AIの分析結果のみに基づく最終的な経営判断の自動化は人間の責任で行うべきものです。',
      options: [
        { text: '月次の売上データを自動集計してレポートを作成する', isCorrect: false },
        { text: '購買データからRFM分析を行い顧客をセグメント化する', isCorrect: false },
        { text: 'AIの分析結果だけで最終的な経営判断を自動化する', isCorrect: true },
        { text: 'アンケートのフリーテキスト回答を分類・感情分析する', isCorrect: false },
      ],
      tagNames: ['AIデータ分析'],
    },
  ])

  // --- Course 2, Chapter 3: AI×コンテンツ生成の実践 ---
  const c2ch3 = await prisma.chapter.create({
    data: {
      title: 'AI×コンテンツ生成の実践',
      description: 'AIを活用した実践的なコンテンツ生成手法を学びます。',
      order: 3,
      courseId: course2.id,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '【ChatGPT】生成AIを活用した「高品質な」SEOコンテンツの作り方',
      type: 'video',
      order: 1,
      chapterId: c2ch3.id,
      youtubeUrl: 'kMiFpgtAr98',
      videoDurationSeconds: 550,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '生成AIを活用した高品質SEOコンテンツの作り方',
      type: 'text',
      order: 2,
      chapterId: c2ch3.id,
      textContent: `# 生成AIを活用した高品質SEOコンテンツの作り方

## AIコンテンツ生成の現状

生成AIの登場により、コンテンツ制作の効率は飛躍的に向上しました。しかし、**AIで生成しただけのコンテンツは「高品質」とは限りません**。Googleが評価するのはAI生成かどうかではなく、**ユーザーにとって有用で信頼できるコンテンツかどうか**です。

### GoogleのAIコンテンツに対する方針
- **AI生成であること自体はペナルティの対象ではない**
- 重要なのは**E-E-A-T（経験・専門性・権威性・信頼性）**を満たしているか
- **スパム目的の大量生成コンテンツ**はガイドライン違反
- ユーザーファーストの**有用なコンテンツ**が評価される

## 高品質なAI SEOコンテンツ制作の5ステップ

### ステップ1：キーワードリサーチと検索意図の分析
AIに丸投げする前に、**ターゲットキーワードと検索意図**を明確にします。

**AIの活用方法:**
- 「○○に関連するロングテールキーワードを50個提案してください」
- 「○○で検索するユーザーの検索意図を分析してください」
- 「○○の関連キーワードをカテゴリ別に分類してください」

**注意点:** AIの提案するキーワードの検索ボリュームは必ず**実際のツール（Googleキーワードプランナー等）で検証**する

### ステップ2：構成案（見出し構造）の作成
検索上位の記事を参考に、AIで**見出し構成案**を作成します。

**プロンプト例:**
「以下のキーワードでSEO記事の構成案を作成してください。
- ターゲットキーワード: ○○
- 検索意図: ○○を知りたい初心者向け
- 記事の目的: ○○の理解と実践
- 見出しはH2・H3で階層化してください」

**ポイント:**
- 検索上位10記事の見出しを分析させる
- **独自の切り口や一次情報を追加**する見出しを含める
- 検索意図に沿った**論理的な流れ**にする

### ステップ3：本文の生成
見出しごとにAIで本文を生成します。**一度に全文を生成するのではなく、セクションごとに分けて指示**するのがコツです。

**効果的なプロンプトの要素:**
1. **ターゲット読者**の明示（例: マーケティング初心者）
2. **トーン＆マナー**の指定（例: 専門的だが分かりやすく）
3. **文字数**の指定（例: この見出しで300〜400文字）
4. **具体例や数値**の要求
5. **出力フォーマット**の指定（箇条書き・表・ステップ形式など）

### ステップ4：人間による編集・加筆
AIが生成した原稿に**人間の専門知識・経験・独自視点**を加えます。これが品質を決定的に左右するステップです。

**編集チェックリスト:**
- [ ] **ファクトチェック**: 数値・固有名詞・日付の正確性を確認
- [ ] **一次情報の追加**: 自社の経験談・事例・データを挿入
- [ ] **独自の見解**: AIにない専門家としての意見を追加
- [ ] **E-E-A-Tの強化**: 経験に基づく具体的なエピソードを追加
- [ ] **コピペチェック**: 類似コンテンツとの重複がないか確認
- [ ] **読みやすさ**: 文章のリズム・段落分け・視覚的要素の調整

### ステップ5：SEO最適化と公開
技術的なSEO要素を最終調整します。

**最適化項目:**
- **タイトルタグ**: キーワードを含む魅力的なタイトル（30〜35文字）
- **メタディスクリプション**: 記事の要約（120文字前後）
- **見出しタグ**: H1→H2→H3の適切な階層構造
- **内部リンク**: 関連する既存記事へのリンク設置
- **画像のalt属性**: 画像の説明テキストを適切に設定
- **構造化データ**: FAQ、HowToなどの構造化マークアップ

## AIコンテンツのリスクと対策

### ハルシネーション（事実誤認）
AIは事実と異なる情報をもっともらしく生成することがあります。
- **対策**: 数値・統計・人物名・日付は必ず一次ソースで確認

### 著作権・類似性の問題
AIは学習データに基づいて生成するため、既存コンテンツと類似する可能性があります。
- **対策**: コピペチェックツールで類似率を確認（目安: 類似率30%以下）

### 独自性・オリジナリティの欠如
AI生成コンテンツは一般的な内容になりがちです。
- **対策**: 自社の一次情報・経験・独自データを必ず追加

### 品質のばらつき
同じプロンプトでも生成のたびに品質が変動します。
- **対策**: 品質管理チェックリストを作成し、一定基準を設ける

## AI×SEOコンテンツの効果的なワークフロー

\`\`\`
1. キーワードリサーチ（AI + ツール検証）
   ↓
2. 検索意図の分析（AI + 上位記事の手動確認）
   ↓
3. 構成案の作成（AI生成 → 人間が調整）
   ↓
4. 本文生成（AI生成：セクションごと）
   ↓
5. 人間による編集（ファクトチェック・一次情報追加・E-E-A-T強化）
   ↓
6. SEO最適化（タイトル・メタ・内部リンク・構造化データ）
   ↓
7. コピペチェック・品質確認
   ↓
8. 公開・効果測定・リライト
\`\`\`

## まとめ：AIは「下書きツール」、仕上げは人間

生成AIはコンテンツ制作の**効率を大幅に向上させる強力なツール**ですが、**最終的な品質を決めるのは人間の編集力**です。AIに下書きを任せ、人間が専門知識・経験・独自視点で仕上げる**ハイブリッドアプローチ**が最も効果的です。`,
    },
  })

  const c2ch3quiz = await prisma.lesson.create({
    data: {
      title: 'AI活用実践の理解度チェック',
      type: 'quiz',
      order: 3,
      chapterId: c2ch3.id,
    },
  })

  await createQuiz(c2ch3quiz.id, 'AIコンテンツ生成の理解度チェック', [
    // --- GoogleのAIコンテンツ方針（2問） ---
    {
      text: 'GoogleのAI生成コンテンツに対する方針として正しいものはどれですか？',
      explanation:
        'Googleは「AI生成かどうか」ではなく「ユーザーにとって有用で信頼できるコンテンツかどうか」で評価します。AI生成であること自体はペナルティの対象ではありません。',
      options: [
        { text: 'AI生成コンテンツはすべて検索結果から除外される', isCorrect: false },
        { text: 'AI生成であること自体はペナルティの対象ではなく、品質と有用性で評価される', isCorrect: true },
        { text: 'AI生成コンテンツには必ず「AI生成」の表記が義務付けられている', isCorrect: false },
        { text: 'AI生成コンテンツは人間が書いた記事より常に高く評価される', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用', 'コンテンツ戦略'],
    },
    {
      text: 'GoogleがコンテンツのSEO評価で重視する「E-E-A-T」の4つの要素の正しい組み合わせはどれですか？',
      explanation:
        'E-E-A-TはExperience（経験）、Expertise（専門性）、Authoritativeness（権威性）、Trustworthiness（信頼性）の4要素です。AIコンテンツにもこの基準が適用されます。',
      options: [
        { text: '効率性・専門性・正確性・適時性', isCorrect: false },
        { text: '経験・専門性・権威性・信頼性', isCorrect: true },
        { text: 'エンゲージメント・専門性・アクセス数・トラフィック', isCorrect: false },
        { text: '編集・評価・分析・テスト', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    // --- コンテンツ制作ステップ（4問） ---
    {
      text: 'AIでSEOコンテンツを作る際、最初に行うべきステップはどれですか？',
      explanation:
        'AIに丸投げする前に、ターゲットキーワードと検索意図を明確にすることが最も重要です。キーワードの選定と検索意図の理解がコンテンツの方向性を決めます。',
      options: [
        { text: 'AIにとにかく記事を書かせる', isCorrect: false },
        { text: 'キーワードリサーチと検索意図の分析', isCorrect: true },
        { text: 'タイトルタグとメタディスクリプションを決める', isCorrect: false },
        { text: '内部リンクの設計から始める', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    {
      text: 'AIでキーワードリサーチを行う際の注意点として正しいものはどれですか？',
      explanation:
        'AIが提案するキーワードの検索ボリュームは推定値であり正確ではないため、Googleキーワードプランナー等の実際のツールで必ず検証する必要があります。',
      options: [
        { text: 'AIの提案するキーワードはすべて正確なので検証不要', isCorrect: false },
        { text: 'AIが提案する検索ボリュームは必ず実際のツールで検証する', isCorrect: true },
        { text: 'キーワードは3語以上のものだけを選ぶべき', isCorrect: false },
        { text: 'AIにキーワードリサーチを依頼してはいけない', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用', 'コンテンツ戦略'],
    },
    {
      text: 'AIで本文を生成する際のコツとして最も効果的なものはどれですか？',
      explanation:
        '一度に全文を生成するのではなく、見出しごと（セクションごと）に分けて指示することで、各セクションの品質を高め、意図に沿った内容を得やすくなります。',
      options: [
        { text: '「この記事を全部書いてください」と一度に指示する', isCorrect: false },
        { text: 'セクション（見出し）ごとに分けて指示する', isCorrect: true },
        { text: 'できるだけ短い指示で自由に書かせる', isCorrect: false },
        { text: '同じプロンプトで10回生成して最良のものを選ぶ', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用', 'プロンプトエンジニアリング'],
    },
    {
      text: 'AIに記事本文を生成させるプロンプトに含めるべき要素として最も重要な組み合わせはどれですか？',
      explanation:
        '効果的なプロンプトにはターゲット読者、トーン＆マナー、文字数、具体例の要求、出力フォーマットの指定を含めることで、意図通りの高品質なコンテンツが得られます。',
      options: [
        { text: 'テーマだけ伝えて自由に書かせる', isCorrect: false },
        { text: 'ターゲット読者・トーン＆マナー・文字数・具体例の要求・出力形式の指定', isCorrect: true },
        { text: '競合記事のURLだけを渡す', isCorrect: false },
        { text: 'SEOキーワードの出現回数だけを指定する', isCorrect: false },
      ],
      tagNames: ['プロンプトエンジニアリング', 'ChatGPT活用'],
    },
    // --- 人間による編集・品質管理（3問） ---
    {
      text: 'AI生成コンテンツの編集で最も品質を左右するステップはどれですか？',
      explanation:
        'AIが生成した原稿に人間の専門知識・経験・独自視点を加える編集ステップが品質を決定的に左右します。一次情報の追加やE-E-A-Tの強化は人間にしかできません。',
      options: [
        { text: '誤字脱字のチェック', isCorrect: false },
        { text: 'AIで再度リライトさせる', isCorrect: false },
        { text: '人間の専門知識・経験・独自視点を加える編集', isCorrect: true },
        { text: 'キーワードの出現頻度を調整する', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    {
      text: 'AIが事実と異なる情報をもっともらしく生成する現象を何と呼びますか？',
      explanation:
        'ハルシネーション（幻覚）とは、AIが事実に基づかない情報をあたかも正しいかのように生成する現象です。数値・統計・人物名・日付は必ず一次ソースで確認が必要です。',
      options: [
        { text: 'オーバーフィッティング', isCorrect: false },
        { text: 'ハルシネーション', isCorrect: true },
        { text: 'バイアス', isCorrect: false },
        { text: 'トークンオーバーフロー', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用'],
    },
    {
      text: 'AI生成コンテンツのコピペチェックで目安とされる類似率の上限はどの程度ですか？',
      explanation:
        'AI生成コンテンツは学習データに基づいて生成されるため既存コンテンツと類似する可能性があり、コピペチェックツールで類似率30%以下を目安に確認します。',
      options: [
        { text: '類似率80%以下', isCorrect: false },
        { text: '類似率50%以下', isCorrect: false },
        { text: '類似率30%以下', isCorrect: true },
        { text: '類似率0%（完全オリジナル）', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    // --- SEO最適化（2問） ---
    {
      text: 'SEO記事のタイトルタグの適切な文字数として推奨されるのはどの程度ですか？',
      explanation:
        'タイトルタグは検索結果に表示される文字数を考慮し、30〜35文字程度が推奨されます。ターゲットキーワードを含みつつ、クリックしたくなる魅力的なタイトルにすることが重要です。',
      options: [
        { text: '10〜15文字', isCorrect: false },
        { text: '30〜35文字', isCorrect: true },
        { text: '60〜80文字', isCorrect: false },
        { text: '100文字以上', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    {
      text: 'SEO記事で見出しタグ（Hタグ）の使い方として正しいものはどれですか？',
      explanation:
        '見出しタグはH1→H2→H3と適切な階層構造にすることでGoogleがコンテンツの構造を理解しやすくなり、SEO評価に良い影響を与えます。H1はページに1つが基本です。',
      options: [
        { text: 'H1をページ内で複数回使い、すべての見出しをH1にする', isCorrect: false },
        { text: 'H1→H2→H3と適切な階層構造にする', isCorrect: true },
        { text: '見出しタグは使わず、太字で代用する', isCorrect: false },
        { text: '見出しタグの順番は自由に使ってよい（H3→H1→H2など）', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    // --- ワークフローと総合（4問） ---
    {
      text: 'AI SEOコンテンツ制作の推奨ワークフローの正しい順序はどれですか？',
      explanation:
        'キーワードリサーチ→検索意図分析→構成案作成→本文生成→人間による編集→SEO最適化→コピペチェック→公開・効果測定の順で進めるのが推奨ワークフローです。',
      options: [
        { text: 'AI生成→公開→効果測定→修正', isCorrect: false },
        { text: 'キーワードリサーチ→構成案→AI本文生成→人間編集→SEO最適化→公開', isCorrect: true },
        { text: 'AI生成→AI品質チェック→自動公開→振り返り', isCorrect: false },
        { text: 'SEO最適化→AI生成→公開→キーワード調査', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用', 'コンテンツ戦略'],
    },
    {
      text: 'AI生成コンテンツがGoogleのガイドライン違反となるケースはどれですか？',
      explanation:
        'Googleはユーザーファーストの有用なコンテンツを評価する一方、スパム目的で大量に自動生成されたコンテンツはガイドライン違反としています。AIの利用自体が問題ではなく、目的と品質が問われます。',
      options: [
        { text: 'AIを使って記事の下書きを作成した場合', isCorrect: false },
        { text: 'AIで構成案を生成してから人間が執筆した場合', isCorrect: false },
        { text: 'スパム目的でAIコンテンツを大量に自動生成した場合', isCorrect: true },
        { text: 'AIで作成した記事を人間が編集して公開した場合', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略'],
    },
    {
      text: 'AIコンテンツ制作で最も効果的なアプローチはどれですか？',
      explanation:
        'AIに下書きを任せ、人間が専門知識・経験・独自視点で仕上げるハイブリッドアプローチが最も効果的です。AIだけでもダメ、人間だけでも非効率です。',
      options: [
        { text: 'すべてのコンテンツをAIだけで作成し、そのまま公開する', isCorrect: false },
        { text: 'AIを一切使わず、すべて手動で作成する', isCorrect: false },
        { text: 'AIで下書きを作り、人間が専門知識と経験で仕上げるハイブリッド手法', isCorrect: true },
        { text: '人間が下書きし、AIに校正だけさせる', isCorrect: false },
      ],
      tagNames: ['ChatGPT活用', 'コンテンツ戦略'],
    },
    {
      text: 'AIコンテンツが独自性に欠ける問題の対策として最も効果的なものはどれですか？',
      explanation:
        'AI生成コンテンツは一般的な内容になりがちなため、自社の一次情報（経験談・事例・独自データ）を必ず追加することでオリジナリティと信頼性を高められます。',
      options: [
        { text: 'プロンプトを変えて何度も生成し直す', isCorrect: false },
        { text: '複数のAIツールを使い分ける', isCorrect: false },
        { text: '自社の一次情報（経験談・事例・独自データ）を追加する', isCorrect: true },
        { text: 'コンテンツの文字数を増やす', isCorrect: false },
      ],
      tagNames: ['コンテンツ戦略', 'ChatGPT活用'],
    },
  ])

  console.log('Created Course 2: AI時代のマーケティング戦略')

  // ============================================================
  // Course 3: 実践Web広告運用
  // ============================================================
  const course3 = await prisma.course.create({
    data: {
      title: '実践Web広告運用',
      description:
        'Google広告やSNS広告の実践的な運用スキルを習得するコースです。広告の設定から効果測定、最適化まで体系的に学びます。',
      category: 'Web広告',
      difficulty: 'advanced',
      isPublished: true,
    },
  })

  // --- Course 3, Chapter 1: Google広告の基礎と設定 ---
  const c3ch1 = await prisma.chapter.create({
    data: {
      title: 'Google広告の基礎と設定',
      description: 'Google広告のアカウント構造と基本設定を学びます。',
      order: 1,
      courseId: course3.id,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '【超有料級】リスティング広告運用の改善方法を徹底解説／分析方法やオススメ入札戦略も解説！【Google広告】',
      type: 'video',
      order: 1,
      chapterId: c3ch1.id,
      youtubeUrl: 'ex0uxXMz6Ew',
      videoDurationSeconds: 2806,
    },
  })

  await prisma.lesson.create({
    data: {
      title: 'リスティング広告運用の改善方法と入札戦略',
      type: 'text',
      order: 2,
      chapterId: c3ch1.id,
      textContent: `# リスティング広告運用の改善方法と入札戦略

## リスティング広告とは
リスティング広告（検索連動型広告）は、Google検索やYahoo!検索の検索結果ページに表示される広告です。ユーザーが特定のキーワードで検索した際に関連する広告が表示されるため、購買意欲の高いユーザーにアプローチできます。

## Google広告のアカウント構造
Google広告は以下の階層構造で管理されます。
1. **アカウント**: 企業・ブランド単位で管理
2. **キャンペーン**: 予算・配信地域・配信スケジュールを管理
3. **広告グループ**: キーワードと広告をテーマごとにまとめる単位
4. **キーワード**: 広告表示のトリガーとなる検索語句
5. **広告文**: 実際にユーザーに表示される広告クリエイティブ

## キーワードマッチタイプ
マッチタイプによって広告が表示される検索クエリの範囲が変わります。
- **完全一致**: 指定したキーワードと完全に一致する検索のみに表示（最も狭い）
- **フレーズ一致**: 指定したキーワードの意味を含む検索に表示
- **インテントマッチ（部分一致）**: 関連する幅広い検索クエリに表示（最も広い）
- **除外キーワード**: 特定の検索クエリで広告を表示しない設定

## 入札戦略の種類と選び方

### 手動入札
- **手動CPC**: クリック単価を広告主が手動で設定。細かなコントロールが可能だが運用負荷が高い

### 自動入札（スマート入札）
- **クリック数最大化**: 予算内でクリック数を最大にする。運用初期やアクセス獲得が目的の場合に有効
- **コンバージョン数最大化**: 予算内でコンバージョン数を最大化。十分なCV数がある場合に効果的
- **目標CPA（tCPA）**: 目標コンバージョン単価を設定し自動最適化。過去30日で30件以上のCVデータが推奨
- **目標ROAS（tROAS）**: 広告費用対効果の目標値を設定。ECサイトなど売上金額が重要な場合に有効

### 入札戦略の移行ステップ
1. **初期段階**: 手動CPC or クリック数最大化でデータ収集
2. **データ蓄積期**: コンバージョン数最大化に移行
3. **最適化期**: 目標CPA or 目標ROASで効率改善

## 品質スコアの改善
品質スコアはGoogle広告の掲載順位とクリック単価に影響する重要な指標です。
- **推定クリック率（CTR）**: 広告がどれだけクリックされるかの予測値
- **広告の関連性**: キーワードと広告文の関連度
- **ランディングページの利便性**: 遷移先ページのユーザー体験

## 広告運用の改善サイクル（PDCA）
1. **Plan**: KPI設定、キーワード選定、広告文作成
2. **Do**: 広告配信開始
3. **Check**: CPA・ROAS・CTR・CVRなどのKPI分析
4. **Action**: 入札調整、除外キーワード追加、広告文改善

## レスポンシブ検索広告（RSA）
複数の見出しと説明文を登録し、Googleの機械学習が最適な組み合わせを自動で表示する広告フォーマットです。
- 見出し: 最大15個（3個以上表示）
- 説明文: 最大4個（2個以上表示）
- ピン留め機能で特定の見出しの表示位置を固定可能

## 分析で見るべき主要指標
- **CPA（顧客獲得単価）**: 1件のコンバージョンにかかった費用
- **ROAS（広告費用対効果）**: 広告費に対する売上の比率
- **CTR（クリック率）**: 表示回数に対するクリック数の割合
- **CVR（コンバージョン率）**: クリック数に対するコンバージョン数の割合
- **インプレッションシェア**: 表示可能だった回数のうち実際に表示された割合`,
    },
  })

  const c3ch1quiz = await prisma.lesson.create({
    data: {
      title: 'リスティング広告運用の理解度チェック',
      type: 'quiz',
      order: 3,
      chapterId: c3ch1.id,
    },
  })

  await createQuiz(c3ch1quiz.id, 'リスティング広告運用の理解度チェック', [
    // --- リスティング広告の基礎 ---
    {
      text: 'リスティング広告（検索連動型広告）の最大の特徴として正しいものはどれですか？',
      explanation:
        'リスティング広告はユーザーが特定のキーワードで検索した際に表示されるため、購買意欲の高いユーザーにピンポイントでアプローチできるのが最大の特徴です。',
      options: [
        { text: 'テレビCMのように不特定多数にリーチできる', isCorrect: false },
        { text: '検索した購買意欲の高いユーザーにピンポイントでアプローチできる', isCorrect: true },
        { text: '一度出稿すると永久に表示され続ける', isCorrect: false },
        { text: '広告費が一切かからない', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    {
      text: 'Google広告のアカウント構造で、予算と配信スケジュールを管理する階層はどれですか？',
      explanation:
        'キャンペーンレベルで日予算、配信地域、配信スケジュールなどの大枠の設定を管理します。',
      options: [
        { text: 'アカウント', isCorrect: false },
        { text: 'キャンペーン', isCorrect: true },
        { text: '広告グループ', isCorrect: false },
        { text: 'キーワード', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    {
      text: '広告グループの役割として最も正しいものはどれですか？',
      explanation:
        '広告グループはキーワードと広告をテーマごとにまとめる単位です。関連性の高いキーワードと広告を同じグループにまとめることで品質スコアが向上します。',
      options: [
        { text: '予算を管理する単位', isCorrect: false },
        { text: 'キーワードと広告をテーマごとにまとめる単位', isCorrect: true },
        { text: 'コンバージョンを計測する単位', isCorrect: false },
        { text: 'アカウント全体の設定を行う単位', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    // --- キーワードマッチタイプ ---
    {
      text: 'キーワードマッチタイプのうち、最も広い範囲の検索クエリに広告が表示されるのはどれですか？',
      explanation:
        'インテントマッチ（旧：部分一致）は指定したキーワードに関連する幅広い検索クエリに対して広告が表示されます。最も多くのユーザーにリーチできますが、無関係なクエリにも表示される可能性があります。',
      options: [
        { text: '完全一致', isCorrect: false },
        { text: 'フレーズ一致', isCorrect: false },
        { text: 'インテントマッチ（部分一致）', isCorrect: true },
        { text: '除外キーワード', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    {
      text: '除外キーワードを設定する主な目的として正しいものはどれですか？',
      explanation:
        '除外キーワードを設定することで、コンバージョンに繋がらない無関係な検索クエリでの広告表示を防ぎ、無駄な広告費の発生を抑制できます。',
      options: [
        { text: '広告の表示回数を増やすため', isCorrect: false },
        { text: '無関係な検索での広告表示を防ぎ、無駄な広告費を抑制するため', isCorrect: true },
        { text: '品質スコアを直接的に上げるため', isCorrect: false },
        { text: 'キャンペーンの予算上限を設定するため', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    // --- 入札戦略 ---
    {
      text: '広告運用の初期段階で推奨される入札戦略はどれですか？',
      explanation:
        '運用初期はコンバージョンデータが不足しているため、手動CPCまたはクリック数最大化でまずデータを収集するのが推奨されます。',
      options: [
        { text: '目標ROAS', isCorrect: false },
        { text: '目標CPA', isCorrect: false },
        { text: '手動CPC または クリック数最大化', isCorrect: true },
        { text: 'インプレッションシェア最大化', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    {
      text: '目標CPA（tCPA）入札戦略を効果的に使用するために推奨されるコンバージョンデータの条件はどれですか？',
      explanation:
        '目標CPA入札はGoogleの機械学習が過去のコンバージョンデータを基に最適化するため、過去30日間で30件以上のコンバージョンデータがあることが推奨されます。',
      options: [
        { text: '過去7日間で5件以上のコンバージョン', isCorrect: false },
        { text: '過去30日間で30件以上のコンバージョン', isCorrect: true },
        { text: '過去1年で100件以上のコンバージョン', isCorrect: false },
        { text: 'コンバージョンデータは不要', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    {
      text: '目標ROAS入札戦略が最も適しているビジネスモデルはどれですか？',
      explanation:
        '目標ROASは広告費用対効果（売上÷広告費）を最適化する入札戦略のため、商品ごとに異なる売上金額があるECサイトなどに最適です。',
      options: [
        { text: '資料請求をゴールとするBtoBサイト', isCorrect: false },
        { text: '商品ごとに異なる売上金額があるECサイト', isCorrect: true },
        { text: 'ブランド認知を目的とした広告', isCorrect: false },
        { text: 'アプリのインストール促進', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    // --- 品質スコア ---
    {
      text: 'Google広告の品質スコアを構成する3つの要素として正しい組み合わせはどれですか？',
      explanation:
        '品質スコアは「推定クリック率」「広告の関連性」「ランディングページの利便性」の3要素で算出されます。品質スコアが高いほど、低いクリック単価で上位に掲載されます。',
      options: [
        { text: '広告費・クリック数・表示回数', isCorrect: false },
        { text: '推定クリック率・広告の関連性・ランディングページの利便性', isCorrect: true },
        { text: 'コンバージョン率・直帰率・滞在時間', isCorrect: false },
        { text: 'キーワード数・広告グループ数・キャンペーン数', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    {
      text: '品質スコアが高いとリスティング広告の運用にどのようなメリットがありますか？',
      explanation:
        '品質スコアが高いと、広告ランク（掲載順位を決める指標）が上がり、同じ掲載位置でもより低いクリック単価で広告を表示できるようになります。',
      options: [
        { text: '広告の審査が免除される', isCorrect: false },
        { text: 'より低いクリック単価で上位に掲載される', isCorrect: true },
        { text: '自動的にコンバージョンが増える', isCorrect: false },
        { text: '予算の上限がなくなる', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    // --- 広告文（RSA） ---
    {
      text: 'レスポンシブ検索広告（RSA）の特徴として正しいものはどれですか？',
      explanation:
        'RSAは複数の見出し（最大15個）と説明文（最大4個）を登録し、Googleの機械学習が検索クエリに応じて最適な組み合わせを自動で選択して表示する広告フォーマットです。',
      options: [
        { text: '見出しと説明文は1つずつしか登録できない', isCorrect: false },
        { text: '複数の見出し・説明文を登録しGoogleが最適な組み合わせを自動表示する', isCorrect: true },
        { text: '画像と動画を組み合わせた広告フォーマット', isCorrect: false },
        { text: 'SNSにのみ配信される広告フォーマット', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    // --- 分析指標 ---
    {
      text: 'CPA（顧客獲得単価）の計算式として正しいものはどれですか？',
      explanation:
        'CPA（Cost Per Acquisition）は広告費用をコンバージョン数で割って算出します。1件のコンバージョンを獲得するためにかかった費用を表します。',
      options: [
        { text: 'クリック数 ÷ 表示回数 × 100', isCorrect: false },
        { text: '広告費用 ÷ コンバージョン数', isCorrect: true },
        { text: '売上 ÷ 広告費用 × 100', isCorrect: false },
        { text: 'コンバージョン数 ÷ クリック数 × 100', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    {
      text: 'ROAS（広告費用対効果）が400%とは、どのような状態を意味しますか？',
      explanation:
        'ROAS 400%は、広告費1円に対して4円の売上が発生している状態です。例えば広告費10万円で売上40万円の場合、ROAS = 40万÷10万×100 = 400%となります。',
      options: [
        { text: '広告費に対して4倍の利益が出ている', isCorrect: false },
        { text: '広告費1円に対して4円の売上が発生している', isCorrect: true },
        { text: 'クリック率が4%である', isCorrect: false },
        { text: 'コンバージョン率が400%を超えている', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    // --- 改善・最適化 ---
    {
      text: 'リスティング広告の改善サイクルにおいて、CTR（クリック率）が低い場合に最初に見直すべき要素はどれですか？',
      explanation:
        'CTRが低い場合、ユーザーの目に触れる広告文（見出し・説明文）がキーワードや検索意図とマッチしていない可能性が高く、広告文の改善が最優先です。',
      options: [
        { text: '入札単価を上げる', isCorrect: false },
        { text: '広告文（見出し・説明文）を改善する', isCorrect: true },
        { text: 'ランディングページを変更する', isCorrect: false },
        { text: '予算を増額する', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
    {
      text: 'インプレッションシェアが低い場合に考えられる主な原因はどれですか？',
      explanation:
        'インプレッションシェアは「表示可能だった回数のうち実際に表示された割合」です。低い場合は、予算不足（予算による損失）または広告ランク不足（ランクによる損失）が主な原因です。',
      options: [
        { text: 'コンバージョン率が高すぎる', isCorrect: false },
        { text: 'キーワード数が多すぎる', isCorrect: false },
        { text: '予算不足または広告ランク不足', isCorrect: true },
        { text: '除外キーワードの設定数が少ない', isCorrect: false },
      ],
      tagNames: ['Google広告'],
    },
  ])

  // --- Course 3, Chapter 2: SNS広告の運用 ---
  const c3ch2 = await prisma.chapter.create({
    data: {
      title: 'SNS広告の運用',
      description: 'Meta広告を中心としたSNS広告の運用手法を学びます。',
      order: 2,
      courseId: course3.id,
    },
  })

  await prisma.lesson.create({
    data: {
      title: 'Metaピクセル基礎とタグ埋め込み方徹底解説／Meta広告／GoogleTagManager設定【コンバージョン設定方法】',
      type: 'video',
      order: 1,
      chapterId: c3ch2.id,
      youtubeUrl: 'AgktSeZ_Mg8',
      videoDurationSeconds: 1084,
    },
  })

  await prisma.lesson.create({
    data: {
      title: 'Metaピクセルの基礎とGoogleタグマネージャーによる設定',
      type: 'text',
      order: 2,
      chapterId: c3ch2.id,
      textContent: `# Metaピクセルの基礎とGoogleタグマネージャーによる設定

## Metaピクセルとは

Metaピクセル（旧Facebookピクセル）は、**Webサイト上のユーザー行動を計測するためのJavaScriptコード**です。Meta広告（Facebook広告・Instagram広告）の効果測定と最適化に不可欠なツールです。

### Metaピクセルの3つの構成要素
1. **ベースコード**: 全ページに設置するピクセルの基盤コード
2. **イベントコード**: 特定のアクション（購入、カート追加等）を計測するコード
3. **パラメータ**: イベントに付随する詳細情報（金額、商品IDなど）

### Metaピクセルで実現できること
- **コンバージョン計測**: 広告経由の購入・問い合わせ等の成果を正確に測定
- **広告最適化**: Metaの機械学習がコンバージョンしやすいユーザーに自動で配信
- **リターゲティング**: サイト訪問者に対して再度広告を配信
- **カスタムオーディエンス作成**: サイト訪問者リストを広告ターゲティングに活用
- **類似オーディエンス**: コンバージョンユーザーに似た新規ユーザーを発見

## Metaピクセルの発行手順

### ステップ1：ビジネスマネージャの準備
1. **Metaビジネスマネージャ**にアクセス（business.facebook.com）
2. ビジネス設定 → データソース → **ピクセル**を選択
3. **「追加」ボタン**でピクセルを新規作成
4. ピクセルに名前をつけて作成

### ステップ2：ピクセルIDの確認
- ピクセル作成後、**ピクセルID（数字の羅列）**が発行される
- このIDをGoogleタグマネージャーで使用する

## Googleタグマネージャー（GTM）とは

Googleタグマネージャー（GTM）は、**Webサイトのタグ（計測コード）を一元管理するツール**です。

### GTMを使うメリット
- **コードを直接編集せずに**タグの設置・管理ができる
- **複数のタグ（Google広告、Meta広告、GA4等）を一箇所で管理**
- タグの追加・変更・削除が**エンジニアなしで可能**
- **バージョン管理**で変更履歴を追跡・ロールバックできる

### GTMの基本概念

| 概念 | 説明 | 例 |
|------|------|-----|
| **タグ** | Webサイトに設置する計測コード | Metaピクセル、GA4タグ |
| **トリガー** | タグを発火させる条件 | ページビュー、ボタンクリック |
| **変数** | タグやトリガーで使用する動的な値 | ページURL、クリックテキスト |
| **コンテナ** | タグ・トリガー・変数をまとめた箱 | サイトごとに1つ |

## GTMでMetaピクセルを設定する手順

### ステップ1：GTMコンテナの設置
1. **GTMアカウント**を作成（tagmanager.google.com）
2. コンテナを作成し、**GTMコンテナコード**を取得
3. コンテナコードをWebサイトの**\`<head>\`タグ内**と**\`<body>\`タグ直後**に設置

### ステップ2：Metaピクセルのベースコード設置
1. GTM管理画面で **「新しいタグ」** を作成
2. タグタイプ：**「カスタムHTML」** を選択
3. Metaピクセルのベースコードを貼り付け（ピクセルIDを含む）
4. トリガー：**「All Pages（全ページ）」** を選択
5. **保存して公開**

### ステップ3：コンバージョンイベントの設定
購入・問い合わせなどの成果を計測するイベントを設定します。

#### 標準イベントの種類

| イベント名 | 用途 |
|-----------|------|
| **PageView** | ページ閲覧（ベースコードに含まれる） |
| **ViewContent** | 商品詳細ページの閲覧 |
| **AddToCart** | カートに商品を追加 |
| **InitiateCheckout** | チェックアウト開始 |
| **Purchase** | 購入完了 |
| **Lead** | 問い合わせ・資料請求 |
| **CompleteRegistration** | 会員登録完了 |

#### GTMでのイベント設定手順
1. 新しいタグ → カスタムHTML → イベントコードを記述
2. トリガー：**特定のページURL**（例：サンクスページ）で発火
3. 必要に応じて**パラメータ**（金額・商品ID等）を追加

### ステップ4：動作確認
1. **GTMプレビューモード**で設置したタグの発火を確認
2. **Meta Events Manager（イベントマネージャー）** でイベントの受信を確認
3. **Meta Pixel Helper**（Chrome拡張機能）でピクセルの動作を検証

## コンバージョンAPI（CAPI）

### CAPIとは
コンバージョンAPI（CAPI）は、**サーバーサイドからMetaにイベントデータを送信する仕組み**です。

### CAPIが必要な理由
- **Cookie規制**（ITP/ETP）によりブラウザベースの計測精度が低下
- CAPIはサーバーから直接データを送るため、**Cookieに依存しない計測**が可能
- **ピクセル + CAPI**の併用でデータの精度と網羅性が向上

## Meta広告のターゲティングとリターゲティング

### ピクセルデータを活用したターゲティング
- **カスタムオーディエンス**: サイト訪問者やイベント実行者のリストを作成
- **類似オーディエンス**: カスタムオーディエンスに似た新規ユーザーにリーチ
- **リターゲティング**: 訪問済みだが未購入のユーザーに再度アプローチ

### リターゲティングのセグメント例
| セグメント | 配信メッセージ例 |
|-----------|---------------|
| カート放棄者 | 「お買い忘れはありませんか？」+ 割引訴求 |
| 商品閲覧者 | 閲覧した商品の広告を表示 |
| 過去購入者 | 関連商品やリピート購入を促進 |
| 一定期間未訪問者 | 新商品やキャンペーン情報を通知 |`,
    },
  })

  const c3ch2quiz = await prisma.lesson.create({
    data: {
      title: 'SNS広告の理解度チェック',
      type: 'quiz',
      order: 3,
      chapterId: c3ch2.id,
    },
  })

  await createQuiz(c3ch2quiz.id, 'Meta広告・GTM設定の理解度チェック', [
    // --- Metaピクセルの基礎（3問） ---
    {
      text: 'Metaピクセルとは何ですか？',
      explanation:
        'MetaピクセルはWebサイト上のユーザー行動を計測するためのJavaScriptコードです。Meta広告（Facebook・Instagram広告）の効果測定と最適化に不可欠なツールです。',
      options: [
        { text: 'Meta社が提供する画像編集ツール', isCorrect: false },
        { text: 'Webサイト上のユーザー行動を計測するJavaScriptコード', isCorrect: true },
        { text: 'Instagram投稿の画像サイズの単位', isCorrect: false },
        { text: 'Meta広告の料金プランの名称', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    {
      text: 'Metaピクセルを構成する3つの要素の正しい組み合わせはどれですか？',
      explanation:
        'Metaピクセルは「ベースコード（全ページの基盤）」「イベントコード（特定アクションの計測）」「パラメータ（イベントの詳細情報）」の3つで構成されます。',
      options: [
        { text: 'HTML・CSS・JavaScript', isCorrect: false },
        { text: 'ベースコード・イベントコード・パラメータ', isCorrect: true },
        { text: 'タグ・トリガー・変数', isCorrect: false },
        { text: 'ヘッダー・ボディ・フッター', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    {
      text: 'Metaピクセルを設置することで実現できないものはどれですか？',
      explanation:
        'Metaピクセルではコンバージョン計測、広告最適化、リターゲティング、カスタムオーディエンス作成が可能ですが、競合他社の広告データを閲覧する機能はありません。',
      options: [
        { text: '広告経由の購入・問い合わせの計測', isCorrect: false },
        { text: 'サイト訪問者へのリターゲティング広告配信', isCorrect: false },
        { text: '競合他社の広告データを閲覧する', isCorrect: true },
        { text: 'コンバージョンしやすいユーザーへの広告最適化', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    // --- Googleタグマネージャー（GTM）の基礎（3問） ---
    {
      text: 'Googleタグマネージャー（GTM）の最大のメリットはどれですか？',
      explanation:
        'GTMを使えばWebサイトのHTMLコードを直接編集せずに、各種計測タグ（Meta広告、Google広告、GA4等）を管理画面から一元管理・設置・変更できます。',
      options: [
        { text: '広告費が自動的に削減される', isCorrect: false },
        { text: 'コードを直接編集せずにタグの設置・管理ができる', isCorrect: true },
        { text: 'SEOの順位が自動的に上がる', isCorrect: false },
        { text: 'Webサイトの表示速度が10倍になる', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    {
      text: 'GTMの基本概念で「トリガー」とは何を指しますか？',
      explanation:
        'GTMのトリガーはタグ（計測コード）を発火させる条件のことです。例えば「ページビュー」「ボタンクリック」「フォーム送信」などの条件を設定し、その条件を満たした時にタグが実行されます。',
      options: [
        { text: 'Webサイトに設置する計測コードそのもの', isCorrect: false },
        { text: 'タグを発火させる条件（ページビュー、クリック等）', isCorrect: true },
        { text: 'タグやトリガーで使用する動的な値', isCorrect: false },
        { text: 'タグ・トリガー・変数をまとめた箱', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    {
      text: 'GTMコンテナコードをWebサイトに設置する正しい場所はどれですか？',
      explanation:
        'GTMコンテナコードは2つの部分があり、1つ目を<head>タグ内のできるだけ上部に、2つ目を<body>タグの直後に設置します。これにより全ページでGTMが正しく動作します。',
      options: [
        { text: '<footer>タグの中にのみ設置する', isCorrect: false },
        { text: '<head>タグ内と<body>タグ直後の2箇所に設置する', isCorrect: true },
        { text: 'CSSファイルの中に埋め込む', isCorrect: false },
        { text: '特定のページにだけ設置すればよい', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    // --- GTMでのMetaピクセル設定（3問） ---
    {
      text: 'GTMでMetaピクセルのベースコードを設置する際のタグタイプとトリガーの正しい組み合わせはどれですか？',
      explanation:
        'Metaピクセルのベースコードは「カスタムHTML」タグタイプで作成し、トリガーには全ページで発火する「All Pages」を設定します。これにより全ページでピクセルが動作します。',
      options: [
        { text: 'タグタイプ: Google Analytics / トリガー: クリック', isCorrect: false },
        { text: 'タグタイプ: カスタムHTML / トリガー: All Pages（全ページ）', isCorrect: true },
        { text: 'タグタイプ: カスタム画像 / トリガー: フォーム送信', isCorrect: false },
        { text: 'タグタイプ: Google広告 / トリガー: ページビュー', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    {
      text: 'Metaピクセルの「Purchase（購入完了）」イベントを計測するために、GTMでトリガーを設定する場合の一般的な方法はどれですか？',
      explanation:
        '購入完了イベントは通常、購入後に表示されるサンクスページ（注文完了ページ）のURLをトリガー条件に設定し、そのページが表示された時にPurchaseイベントのタグが発火するようにします。',
      options: [
        { text: '全ページでPurchaseイベントを発火させる', isCorrect: false },
        { text: 'サンクスページ（注文完了ページ）のURL条件でトリガーを設定する', isCorrect: true },
        { text: 'カートページのボタンクリックで発火させる', isCorrect: false },
        { text: '商品一覧ページが表示された時に発火させる', isCorrect: false },
      ],
      tagNames: ['SNS広告', 'リターゲティング'],
    },
    {
      text: 'GTMでタグを設定した後、公開前に行うべき確認作業はどれですか？',
      explanation:
        'GTMのプレビューモードを使って設定したタグが正しく発火するかテストし、Meta Events Managerやpixel Helperでイベントの受信を確認してから公開すべきです。',
      options: [
        { text: '確認作業は不要でそのまま公開する', isCorrect: false },
        { text: 'プレビューモードでタグの発火を確認し、Events Managerでイベント受信を検証する', isCorrect: true },
        { text: '広告を出稿してからタグの動作を確認する', isCorrect: false },
        { text: 'HTMLソースコードに直接タグを書き換えてテストする', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    // --- コンバージョンイベントと標準イベント（2問） ---
    {
      text: 'Metaピクセルの標準イベントで「Lead」が示すユーザーアクションはどれですか？',
      explanation:
        'Leadイベントは問い合わせフォームの送信や資料請求など、見込み顧客（リード）の獲得を示すイベントです。BtoBビジネスでよく使用されます。',
      options: [
        { text: '商品をカートに追加した', isCorrect: false },
        { text: '会員登録を完了した', isCorrect: false },
        { text: '問い合わせ・資料請求を行った', isCorrect: true },
        { text: '商品を購入した', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    {
      text: 'ECサイトでMetaピクセルのイベントを設定する場合、「ViewContent → AddToCart → InitiateCheckout → Purchase」の順序が重要な理由はどれですか？',
      explanation:
        'この順序はユーザーの購買ファネル（商品閲覧→カート追加→決済開始→購入完了）を表しており、各段階でのデータを取得することでMetaの機械学習がコンバージョンを正確に最適化できるようになります。',
      options: [
        { text: 'この順序でないとピクセルがエラーになるから', isCorrect: false },
        { text: '購買ファネルの各段階のデータでMetaの機械学習が最適化されるから', isCorrect: true },
        { text: 'Meta社の規約でこの順序が義務付けられているから', isCorrect: false },
        { text: 'イベント名はアルファベット順に設定する必要があるから', isCorrect: false },
      ],
      tagNames: ['SNS広告', 'リターゲティング'],
    },
    // --- コンバージョンAPIとCookie規制（2問） ---
    {
      text: 'コンバージョンAPI（CAPI）が必要とされる主な理由はどれですか？',
      explanation:
        'ITP（Intelligent Tracking Prevention）等のCookie規制により、ブラウザベースのピクセル計測の精度が低下しています。CAPIはサーバーサイドから直接Metaにデータを送信するため、Cookieに依存しない正確な計測が可能です。',
      options: [
        { text: 'ピクセルより広告費が安くなるから', isCorrect: false },
        { text: 'Cookie規制でブラウザベースの計測精度が低下しているから', isCorrect: true },
        { text: 'CAPIを使わないとMeta広告が配信できないから', isCorrect: false },
        { text: 'CAPIはピクセルの代替で、ピクセルは不要になるから', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    {
      text: 'MetaピクセルとコンバージョンAPI（CAPI）の推奨される運用方法はどれですか？',
      explanation:
        'ピクセル（ブラウザサイド）とCAPI（サーバーサイド）を併用することで、データの精度と網羅性が最大化されます。CAPIだけ、ピクセルだけよりも両方を使うことが推奨されています。',
      options: [
        { text: 'CAPIを導入したらピクセルは削除する', isCorrect: false },
        { text: 'ピクセルとCAPIを併用して計測の精度と網羅性を最大化する', isCorrect: true },
        { text: 'ピクセルだけで十分なのでCAPIは不要', isCorrect: false },
        { text: 'CAPIとピクセルは同時に使うとエラーになる', isCorrect: false },
      ],
      tagNames: ['SNS広告'],
    },
    // --- ターゲティングとリターゲティング（2問） ---
    {
      text: 'Metaピクセルのデータを活用して作成する「類似オーディエンス」とは何ですか？',
      explanation:
        '類似オーディエンスは、カスタムオーディエンス（サイト訪問者や購入者等）と似た属性・行動パターンを持つ新規ユーザーを見つけてターゲティングする機能です。',
      options: [
        { text: '自社サイトを過去に訪問したユーザーのリスト', isCorrect: false },
        { text: '既存の顧客リストと似た属性を持つ新規ユーザーにリーチする機能', isCorrect: true },
        { text: '競合他社のフォロワーをターゲティングする機能', isCorrect: false },
        { text: '広告を表示する地域を類似する地域に拡大する機能', isCorrect: false },
      ],
      tagNames: ['SNS広告', 'リターゲティング'],
    },
    {
      text: 'リターゲティング広告で「カート放棄者」に対する効果的なアプローチはどれですか？',
      explanation:
        'カート放棄者には限定割引や送料無料などの特典を訴求することで、購入を妨げていた障壁を取り除きコンバージョンを促進できます。同じ商品の大量表示はユーザーに不快感を与えます。',
      options: [
        { text: '同じ商品の広告を大量に表示する', isCorrect: false },
        { text: '割引や特典を訴求して購入の障壁を取り除く', isCorrect: true },
        { text: '関連のない新商品を紹介する', isCorrect: false },
        { text: '広告の配信を完全に停止する', isCorrect: false },
      ],
      tagNames: ['リターゲティング'],
    },
  ])

  // --- Course 3, Chapter 3: 広告効果測定と最適化 ---
  const c3ch3 = await prisma.chapter.create({
    data: {
      title: '広告効果測定と最適化',
      description: '広告の効果を正確に測定し、継続的に改善する方法を学びます。',
      order: 3,
      courseId: course3.id,
    },
  })

  await prisma.lesson.create({
    data: {
      title: 'ウェブメディアのKPI設定！広告マネタイズにおける適切な設定方法とは',
      type: 'video',
      order: 1,
      chapterId: c3ch3.id,
      youtubeUrl: 'kHj-9c7l2Dk',
      videoDurationSeconds: 495,
    },
  })

  await prisma.lesson.create({
    data: {
      title: '広告KPIの設定方法と効果測定の実践',
      type: 'text',
      order: 2,
      chapterId: c3ch3.id,
      textContent: `# 広告KPIの設定方法と効果測定の実践

## なぜKPI設定が重要なのか

Web広告を運用する際、**KPI（重要業績評価指標）を適切に設定しないと、何が成功で何が失敗か判断できません**。KPIは広告の目的から逆算して設計し、定期的にモニタリング・改善することで、広告投資の効果を最大化できます。

## KGI・KPI・KSFの関係

### KGI（Key Goal Indicator：重要目標達成指標）
ビジネスの**最終目標**を数値化したもの。
- 例：月間売上1,000万円、年間リード獲得数500件

### KPI（Key Performance Indicator：重要業績評価指標）
KGI達成のための**中間指標**。進捗を定量的に把握する。
- 例：広告経由のCV数、CPA、ROAS、CTR

### KSF（Key Success Factor：重要成功要因）
KPI達成のために**最も影響力のある施策や要因**。
- 例：ターゲティング精度の向上、LP改善、入札戦略の最適化

\`\`\`
KGI（最終目標）
  ↑
KPI（中間指標）← 定期モニタリング
  ↑
KSF（成功要因）← 施策実行
\`\`\`

## 広告目的別のKPI設定

### 認知拡大（ブランド認知）

| KPI | 説明 | 目安 |
|-----|------|------|
| **インプレッション数** | 広告が表示された回数 | 業界・予算による |
| **リーチ数** | 広告を見たユニークユーザー数 | - |
| **CPM（インプレッション単価）** | 1,000回表示あたりの費用 | 100〜1,000円 |
| **動画視聴率** | 動画広告が一定時間以上視聴された割合 | 20〜40% |
| **ブランドリフト** | 広告接触前後でのブランド認知度の変化 | - |

### サイト集客（トラフィック獲得）

| KPI | 説明 | 目安 |
|-----|------|------|
| **クリック数** | 広告がクリックされた回数 | - |
| **CTR（クリック率）** | クリック数 ÷ インプレッション数 × 100 | 1〜5% |
| **CPC（クリック単価）** | 広告費 ÷ クリック数 | 50〜500円 |
| **セッション数** | サイトへの訪問数 | - |
| **直帰率** | 1ページだけ見て離脱した割合 | 40〜60% |

### コンバージョン獲得（成果獲得）

| KPI | 説明 | 計算式 |
|-----|------|--------|
| **CV数** | コンバージョン（成果）の件数 | - |
| **CVR（コンバージョン率）** | CVに至った割合 | CV数 ÷ クリック数 × 100 |
| **CPA（顧客獲得単価）** | 1件のCV獲得にかかった費用 | 広告費 ÷ CV数 |
| **ROAS（広告費用対効果）** | 広告費に対する売上の比率 | 売上 ÷ 広告費 × 100（%） |

## 主要KPI指標の詳細解説

### CPA（Cost Per Acquisition）
**1件のコンバージョンを獲得するのにかかった費用**。

- **計算式**: CPA = 広告費 ÷ コンバージョン数
- **例**: 広告費50万円で50件のCV → CPA = 10,000円
- **改善方法**: CTR改善（広告文最適化）、CVR改善（LP最適化）、無駄クリックの削減

### ROAS（Return On Ad Spend）
**広告費に対してどれだけの売上があったかの比率**。

- **計算式**: ROAS = 売上 ÷ 広告費 × 100（%）
- **例**: 広告費50万円で売上200万円 → ROAS = 400%
- **目安**: 一般的に300%以上で利益が出るケースが多い（利益率による）

### CTR（Click Through Rate）
**広告が表示された回数に対するクリック率**。

- **計算式**: CTR = クリック数 ÷ インプレッション数 × 100
- **リスティング広告の目安**: 3〜10%
- **ディスプレイ広告の目安**: 0.1〜0.5%
- **改善方法**: 広告文・クリエイティブの改善、ターゲティングの精度向上

### CVR（Conversion Rate）
**クリックしたユーザーのうちコンバージョンに至った割合**。

- **計算式**: CVR = CV数 ÷ クリック数 × 100
- **目安**: 1〜5%（業界・商品による）
- **改善方法**: LP（ランディングページ）の最適化、フォーム改善、オファーの見直し

## 効果測定のPDCAサイクル

### Plan（計画）
- KGIから逆算してKPIを設定
- 目標CPAや目標ROASを決定
- 予算とスケジュールを策定

### Do（実行）
- 広告を配信開始
- 複数のクリエイティブ・ターゲティングを同時テスト

### Check（評価）
- KPIの達成状況をモニタリング
- 指標の変化要因を分析
- **ファネル分析**: インプレッション→クリック→LP閲覧→CV のどの段階にボトルネックがあるか特定

### Act（改善）
- ボトルネックに応じた施策を実行
  - CTRが低い → 広告文・クリエイティブを改善
  - CVRが低い → ランディングページを改善
  - CPAが高い → ターゲティング・入札を見直し

## A/Bテストによる最適化

### A/Bテストとは
2つ以上のバリエーションを同時に配信し、**統計的にどちらが優れているかを検証**する手法です。

### テスト可能な要素
- **広告文**: 見出し・説明文の文言
- **クリエイティブ**: 画像・動画素材
- **CTA**: ボタンの文言・色
- **ランディングページ**: ページ構成・デザイン
- **ターゲティング**: オーディエンスセグメント

### A/Bテストの5ステップ
1. **仮説立案**: 「見出しにベネフィットを入れるとCTRが上がるのでは？」
2. **テスト設計**: 変更要素は**1つに限定**、十分なサンプルサイズを確保
3. **テスト実施**: **同一期間・同一条件**で配信
4. **結果分析**: **統計的有意差（p値 < 0.05）**を確認
5. **施策反映**: 勝者バリエーションを本番に適用

### テストの注意点
- テスト期間は**最低1〜2週間**を確保
- **同時に複数の要素を変えない**（何が効いたか分からなくなる）
- 結果を記録し**ナレッジとして蓄積**する`,
    },
  })

  const c3ch3quiz = await prisma.lesson.create({
    data: {
      title: '効果測定の理解度チェック',
      type: 'quiz',
      order: 3,
      chapterId: c3ch3.id,
    },
  })

  await createQuiz(c3ch3quiz.id, '広告KPIと効果測定の理解度チェック', [
    // --- KGI・KPI・KSFの関係（2問） ---
    {
      text: 'KGI・KPI・KSFの関係として正しいものはどれですか？',
      explanation:
        'KGI（重要目標達成指標）はビジネスの最終目標、KPI（重要業績評価指標）はKGI達成のための中間指標、KSF（重要成功要因）はKPI達成のための施策や要因です。KGIから逆算してKPIとKSFを設定します。',
      options: [
        { text: 'KGI・KPI・KSFはすべて同じ意味である', isCorrect: false },
        { text: 'KGIが最終目標、KPIが中間指標、KSFが成功要因', isCorrect: true },
        { text: 'KPIが最終目標、KGIが中間指標、KSFが予算', isCorrect: false },
        { text: 'KSFが最終目標で、KGIとKPIはその下位概念', isCorrect: false },
      ],
      tagNames: ['KPI設計'],
    },
    {
      text: '広告のKPIを設定する際、最初に明確にすべきことはどれですか？',
      explanation:
        'KPIはKGI（最終目標）から逆算して設計するため、まずビジネスの最終目標（月間売上、リード獲得数等）を明確にすることが出発点です。',
      options: [
        { text: '広告のクリエイティブデザイン', isCorrect: false },
        { text: '使用する広告プラットフォーム', isCorrect: false },
        { text: 'ビジネスの最終目標（KGI）', isCorrect: true },
        { text: '競合他社の広告費', isCorrect: false },
      ],
      tagNames: ['KPI設計'],
    },
    // --- 広告目的別KPI（2問） ---
    {
      text: '「認知拡大」を目的とする広告キャンペーンで最も重視すべきKPIはどれですか？',
      explanation:
        '認知拡大が目的の場合、どれだけ多くのユーザーに広告が届いたかを示す「リーチ数」と「インプレッション数」、そして1,000回表示あたりの費用である「CPM」が最も重要なKPIとなります。',
      options: [
        { text: 'CPA（顧客獲得単価）', isCorrect: false },
        { text: 'CVR（コンバージョン率）', isCorrect: false },
        { text: 'リーチ数・インプレッション数・CPM', isCorrect: true },
        { text: 'ROAS（広告費用対効果）', isCorrect: false },
      ],
      tagNames: ['KPI設計'],
    },
    {
      text: 'ECサイトの売上拡大を目的とする広告で最も重視すべきKPIはどれですか？',
      explanation:
        'ECサイトの売上拡大が目的の場合、広告費に対してどれだけの売上を生み出しているかを示すROAS（広告費用対効果）とCPA（顧客獲得単価）が最重要KPIです。',
      options: [
        { text: 'インプレッション数のみ', isCorrect: false },
        { text: 'フォロワー増加数', isCorrect: false },
        { text: 'ROAS（広告費用対効果）とCPA（顧客獲得単価）', isCorrect: true },
        { text: '動画視聴率', isCorrect: false },
      ],
      tagNames: ['KPI設計', 'Googleアナリティクス'],
    },
    // --- 主要KPI指標の計算（4問） ---
    {
      text: 'CPA（顧客獲得単価）の計算式として正しいものはどれですか？',
      explanation:
        'CPA（Cost Per Acquisition）は広告費用をコンバージョン数で割って算出します。例えば広告費50万円で50件のCVがあった場合、CPA = 50万 ÷ 50 = 10,000円です。',
      options: [
        { text: 'クリック数 ÷ 表示回数 × 100', isCorrect: false },
        { text: '広告費 ÷ コンバージョン数', isCorrect: true },
        { text: '売上 ÷ 広告費 × 100', isCorrect: false },
        { text: 'コンバージョン数 ÷ クリック数 × 100', isCorrect: false },
      ],
      tagNames: ['KPI設計'],
    },
    {
      text: 'ROAS 400%とはどのような状態を意味しますか？',
      explanation:
        'ROAS 400%は、広告費1円に対して4円の売上が発生している状態です。計算式はROAS = 売上 ÷ 広告費 × 100で、例えば広告費10万円で売上40万円の場合、ROAS = 40万÷10万×100 = 400%となります。',
      options: [
        { text: '広告費が400%増加した', isCorrect: false },
        { text: '広告費1円に対して4円の売上が発生している', isCorrect: true },
        { text: 'コンバージョン率が4%である', isCorrect: false },
        { text: '広告費の4%が利益になっている', isCorrect: false },
      ],
      tagNames: ['KPI設計', 'Googleアナリティクス'],
    },
    {
      text: 'CTR（クリック率）の計算式として正しいものはどれですか？',
      explanation:
        'CTR（Click Through Rate）はクリック数をインプレッション数で割って100をかけた値です。広告がどれだけ興味を引いているかを測る指標で、リスティング広告では3〜10%が目安です。',
      options: [
        { text: 'コンバージョン数 ÷ クリック数 × 100', isCorrect: false },
        { text: '広告費 ÷ クリック数', isCorrect: false },
        { text: 'クリック数 ÷ インプレッション数 × 100', isCorrect: true },
        { text: 'インプレッション数 ÷ リーチ数 × 100', isCorrect: false },
      ],
      tagNames: ['KPI設計'],
    },
    {
      text: 'CVR（コンバージョン率）が低い場合に最初に見直すべき要素はどれですか？',
      explanation:
        'CVRはクリック後にコンバージョンに至った割合です。CVRが低い場合、ユーザーがクリック後に訪れるランディングページ（LP）の構成・デザイン・フォーム・オファーに問題がある可能性が高いため、LP改善が最優先です。',
      options: [
        { text: '広告の入札単価を上げる', isCorrect: false },
        { text: 'ランディングページ（LP）の構成やオファーを改善する', isCorrect: true },
        { text: '広告の配信時間帯を変更する', isCorrect: false },
        { text: 'キーワードの数を増やす', isCorrect: false },
      ],
      tagNames: ['KPI設計', 'Googleアナリティクス'],
    },
    // --- PDCAサイクルとファネル分析（2問） ---
    {
      text: '広告効果測定のPDCAサイクルの「Check（評価）」で行うファネル分析の目的はどれですか？',
      explanation:
        'ファネル分析はインプレッション→クリック→LP閲覧→CVの流れの中で、どの段階にボトルネック（離脱ポイント）があるかを特定することが目的です。これにより改善施策を正確に決定できます。',
      options: [
        { text: '広告の予算配分を自動で最適化する', isCorrect: false },
        { text: 'インプレッション→クリック→CVの各段階でボトルネックを特定する', isCorrect: true },
        { text: '競合他社の広告パフォーマンスを比較する', isCorrect: false },
        { text: '新しい広告クリエイティブを自動生成する', isCorrect: false },
      ],
      tagNames: ['KPI設計', 'A/Bテスト'],
    },
    {
      text: 'CTR（クリック率）は高いがCVR（コンバージョン率）が低い場合、最も可能性の高い原因はどれですか？',
      explanation:
        'CTRが高いということは広告自体は興味を引いているが、CVRが低いのはクリック後のランディングページが広告の訴求内容とズレている、またはLPのユーザー体験に問題がある可能性が高いです。',
      options: [
        { text: '広告文が魅力的でない', isCorrect: false },
        { text: '広告のターゲティングが広すぎる', isCorrect: false },
        { text: 'ランディングページが広告の訴求とズレている、またはLP体験に問題がある', isCorrect: true },
        { text: '広告の予算が少なすぎる', isCorrect: false },
      ],
      tagNames: ['KPI設計', 'Googleアナリティクス'],
    },
    // --- A/Bテスト（2問） ---
    {
      text: 'A/Bテストで正確な結果を得るために最も重要な原則はどれですか？',
      explanation:
        'A/Bテストでは変更する要素を1つに限定することが最重要です。複数の要素を同時に変えると、どの変更が結果に影響したか分からなくなり、正確な知見が得られません。',
      options: [
        { text: 'できるだけ多くのバリエーションを同時にテストする', isCorrect: false },
        { text: '変更要素を1つに限定し、十分なサンプルサイズを確保する', isCorrect: true },
        { text: 'テスト期間を1日に限定して結果を早く出す', isCorrect: false },
        { text: 'テスト中に予算や設定を頻繁に調整する', isCorrect: false },
      ],
      tagNames: ['A/Bテスト'],
    },
    {
      text: 'A/Bテストの結果を判断する際に確認すべき統計的指標はどれですか？',
      explanation:
        '統計的有意性（p値）を確認することで、結果が偶然の差ではなく有意な差であることを判断できます。一般的にp値が0.05未満であれば統計的に有意とされます。',
      options: [
        { text: 'フォロワー数の変化', isCorrect: false },
        { text: '統計的有意性（p値が0.05未満）', isCorrect: true },
        { text: '広告の掲載順位', isCorrect: false },
        { text: 'ページの読み込み速度', isCorrect: false },
      ],
      tagNames: ['A/Bテスト'],
    },
    // --- CPMとCPC（2問） ---
    {
      text: 'CPM（Cost Per Mille）とは何を表す指標ですか？',
      explanation:
        'CPM（Cost Per Mille）は広告が1,000回表示されるためにかかる費用です。認知拡大やブランディング目的の広告で重視される指標で、Milleはラテン語で「1,000」を意味します。',
      options: [
        { text: '1クリックあたりの費用', isCorrect: false },
        { text: '1,000回表示あたりの広告費用', isCorrect: true },
        { text: '1コンバージョンあたりの費用', isCorrect: false },
        { text: '1日あたりの広告予算', isCorrect: false },
      ],
      tagNames: ['KPI設計'],
    },
    {
      text: 'CPC（クリック単価）を下げるために最も効果的な施策はどれですか？',
      explanation:
        'CPC（Cost Per Click）を下げるには広告の品質スコアを上げることが最も効果的です。品質スコアが高いと広告ランクが上がり、同じクリック単価でもより有利な掲載が可能になります。具体的にはCTRの向上、広告文とキーワードの関連性向上、LP改善が有効です。',
      options: [
        { text: '入札単価を上限なく引き上げる', isCorrect: false },
        { text: '広告の品質スコアを上げる（CTR向上・広告関連性・LP改善）', isCorrect: true },
        { text: '広告の配信地域を全世界に拡大する', isCorrect: false },
        { text: 'すべてのキーワードを完全一致にする', isCorrect: false },
      ],
      tagNames: ['KPI設計', 'Google広告'],
    },
    // --- 総合問題（1問） ---
    {
      text: '広告運用において「CPAが目標より高い」場合の改善アプローチとして最も体系的なものはどれですか？',
      explanation:
        'CPAが高い場合、ファネルの各段階を分析して原因を特定します。CTRが低ければ広告文改善、CVRが低ければLP改善、CPCが高ければターゲティング・入札の見直しなど、ボトルネックに応じた施策を実行します。',
      options: [
        { text: 'とにかく広告予算を増額する', isCorrect: false },
        { text: 'ファネル分析でCTR・CVR・CPCのどこにボトルネックがあるか特定し、段階に応じた施策を実行する', isCorrect: true },
        { text: '広告配信を一度すべて停止してやり直す', isCorrect: false },
        { text: '他社の広告をそのまま真似する', isCorrect: false },
      ],
      tagNames: ['KPI設計', 'A/Bテスト', 'Googleアナリティクス'],
    },
  ])

  console.log('Created Course 3: 実践Web広告運用')

  // ============================================================
  // Summary
  // ============================================================
  const courseCount = await prisma.course.count()
  const chapterCount = await prisma.chapter.count()
  const lessonCount = await prisma.lesson.count()
  const quizCount = await prisma.quiz.count()
  const questionCount = await prisma.question.count()
  const tagCount = await prisma.questionTag.count()

  console.log('\n--- Seed Summary ---')
  console.log(`Courses: ${courseCount}`)
  console.log(`Chapters: ${chapterCount}`)
  console.log(`Lessons: ${lessonCount}`)
  console.log(`Quizzes: ${quizCount}`)
  console.log(`Questions: ${questionCount}`)
  console.log(`Tags: ${tagCount}`)
  console.log('Seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
