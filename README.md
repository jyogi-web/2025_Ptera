# Ptera

# 完成品

デプロイ先
<https://2025-ptera.vercel.app/>

デモ動画

<https://youtu.be/GJS2rUClz1g>

# 【アプリ概要】

サークルの部員をカード化してコレクションできます
写真を撮って情報を入力するとカード化して保存
対戦機能も実装、QRコードでミニゲーム可能です

## このアプリの良さ

- **サークルメンバーの資産化**: 仲間をカードとしてコレクションすることで、サークルへの帰属意識を高め、交流を可視化できるはず。
- **AIによるスマートな生成**: 面倒なプロフィール入力はAIにお任せ。写真からその人の特徴を捉えたステータスを自動生成します。
- **こだわりのサイバーUI**: Arwesライブラリを駆使したSFチックなインターフェースが、カード収集の没入感を高めます。
- **サークル対抗の対戦**: サークルの団結力を上げるほか、他の団体のことも知れる対戦機能です。
- **推し部員**: 推しを設定することでやる気UP！
- **リアルとデジタルの融合**: QRコードを用いた対戦機能により、対面での集まりをよりエキサイティングなものにします。

# ユーザーフロー

1. ログイン(Google)を行う
2. サークルへの参加
3. カード化のための写真を撮影またはフォルダからアップロード
4. 必要なデータを入力(入力しなかった分はAI補完）
5. カード化！
6. サークルメンバーでデッキを作って対戦！

その他ミニゲームも遊べる！

- QRメンコ
- 指バンバン

![image](https://ptera-publish.topaz.dev/project/01KCZFKMBM3TP22F7T56GXDVEA.png)

# 技術の話

## フロントエンド

### 使用技術

```
"next": "16.0.10",
"react": "19.2.1",
"tailwindcss": "^4",
"@arwes/react": "^1.0.0-next.25020502",
"firebase": "^12.6.0",
"firebase-admin": "^13.6.0",
"@connectrpc/connect": "^2.1.1",
"@connectrpc/connect-node": "^2.1.1",
"@bufbuild/protobuf": "^2.10.2",
"react-webcam": "^7.2.0",
"jsqr": "^1.4.0",
"qrcode": "^1.5.4",
"@biomejs/biome": "^2.3.10",
"vitest": "^4.0.15"
```

### デプロイ手順

vercelポン乗せではなく、GithubActionsを用いてデプロイを行いました！
Vercelのチームは有料であるためデプロイ周りを管理者しか触ることができていませんでしたが、GithubActionsで管理することでいじることができました

<details>
<summary>deploy workflow</summary>

```yaml
name: CI/CD

on:
  push:
    branches:
      - main
    paths:
      - 'front/**'
  pull_request:
    paths:
      - 'front/**'

jobs:
  checks:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
      NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
      FIREBASE_SERVICE_ACCOUNT_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}
    defaults:
      run:
        working-directory: front

    steps:
      - name: Check out the code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: front/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint check
        run: npm run lint

      - name: Format check
        run: npm run format

      - name: Run tests
        run: npm run test

      - name: Build check
        run: npm run build

  deploy:
    needs: checks
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: front
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Check out the code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

```

</details>

## バックエンド

### gRPCを用いたバックエンド

バックエンドはgRPCを用いたgoのバックエンドを構築しました

```proto
service BattleService {
  rpc StartBattle(StartBattleRequest) returns (StartBattleResponse);
  rpc Attack(AttackRequest) returns (AttackResponse);
  rpc Retreat(RetreatRequest) returns (RetreatResponse);

  // Battle Request (Matching) RPCs
  rpc SendBattleRequest(SendBattleRequestRequest) returns (BattleRequest);
  rpc AcceptBattleRequest(AcceptBattleRequestRequest) returns (BattleState);
  rpc RejectBattleRequest(RejectBattleRequestRequest) returns (BattleRequest);
}
```

### プロトコルバッファーでの生成

![image](https://ptera-publish.topaz.dev/project/01KCZG1EJ12G21WVHJRQADGA8V.png)

## 開発周りの話

### lefthook🤛導入 〜何を四天王！〜

めちゃくちゃフォーマットかけ忘れマンなのでpre-commitを導入しました〜

```yaml
# Lefthook configuration for 2025_Ptera
# https://lefthook.dev/configuration/

pre-commit:
  parallel: true
  commands:
    lint:
      glob: "front/**/*.{js,ts,jsx,tsx}"
      run: cd front && npm run lint:fix
      stage_fixed: true

    format:
      glob: "front/**/*.{js,ts,jsx,tsx,json,md,yml,yaml}"
      run: cd front && npm run format:fix
      stage_fixed: true

    typescript:
      glob: "front/**/*.{ts,tsx}"
      run: cd front && npx tsc --noEmit --skipLibCheck

pre-push:
  commands:
    test:
      run: cd front && npm test
```

pre-commitの管理にはLefthookを導入してみて、結構楽に導入できたとという印象です
<https://qiita.com/KOU050223/items/35cfaedefad2bc88a89d>

### [coderabbit](https://www.coderabbit.ai/ja)導入 〜レビュー大臣〜

coderabbitを入れることで以下の点をカバーしました！

- 複数視点でのレビュー(`〇〇の観点により✖️✖️を改善しましょう！`)
- PRのサマリー
- issueの詳細なプランを立ててくれる
- @coderabbitaiで呼び出して会話！
- パブリックリポジトリは無料でレビューしてくれる

プロジェクトに`.coderabbit.yaml`を導入することで、特定の指示をすることができます

<details>
<summary>deploy workflow</summary>

```yaml
# yaml-language-server: $schema=https://coderabbit.ai/integrations/schema.v2.json
language: "ja-JP"
tone_instructions: "丁寧な言葉遣いで、具体的な改善点を指摘してください。"
early_access: false

reviews:
  profile: "assertive"
  request_changes_workflow: true
  high_level_summary: true
  review_status: true
  collapse_walkthrough: false
  suggested_reviewers: true
  
  path_instructions:
    - path: "**/*.{ts,tsx}"
      instructions: |
        TypeScript、React、Next.jsのベストプラクティスに従い、
        コードの可読性とメンテナンス性を向上させてください。
        命名規則：コンポーネント名はPascalCase、関数・変数名はcamelCaseで統一。
        型安全性：anyの使用を避け、適切な型定義を行う。
        コンポーネント設計：単一責任の原則（SRP）を意識し、再利用可能なコンポーネントを作成。
        Server/Client Components：Next.js App Routerでは、Server ComponentsとClient Componentsを適切に使い分ける。Server Componentsでは非同期処理とデータフェッチを直接実行、Client Componentsではインタラクティブな機能と状態管理を担当。
        パフォーマンス：不要な再レンダリングを避け、useMemo、useCallbackを適切に使用。
        データフェッチング：Server Componentsでのfetch（キャッシュ戦略含む）、Client ComponentsでのuseEffectや非同期フックを適切に使い分ける。
        エラーハンドリング：error.tsxやloading.tsxを活用し、適切なエラー処理とローディング状態を実装。
        セキュリティ：XSS対策、環境変数の適切な管理（NEXT_PUBLIC_プレフィックス）を徹底。
        アクセシビリティ：セマンティックなHTML、ARIA属性を適切に使用。
        テスト：重要なロジックやコンポーネントには単体テストを追加。
    - path: "**/src/app/**/page.tsx"
      instructions: |
        Next.js App Routerのページコンポーネントとして適切に実装してください。
        Server Componentを優先し、クライアント側の処理が必要な場合のみ'use client'を使用。
        メタデータはmetadataオブジェクトまたはgenerateMetadata関数で定義。
        データフェッチングはasync/awaitで直接実行し、キャッシュ戦略（force-cache, no-store等）を明示。

    - path: "**/src/app/**/layout.tsx"
      instructions: |
        レイアウトコンポーネントとして、共通のUI要素やプロバイダーを適切に配置。
        不要な再レンダリングを避けるため、状態管理は慎重に行う。
        メタデータはルートレイアウトで定義し、子レイアウトで上書き可能。

  auto_review:
    enabled: true

chat:
  auto_reply: true
```

</details>

### アーキテクチャ図作成

これはclaudecodeくんにdrawioで書いて若干修正してみました！
最近QiitaかZennで記事を見たので...

XMLでわりかしトークンを食う...?

以下使ったプロンプト

```plaintext
draw.io で〇〇図を作成してください。以下のルールに従ってください。

- mxGraphModel に defaultFontFamily="フォント名" を設定
- すべてのテキスト要素の style に fontFamily=フォント名; を追加
- フォントサイズは標準の1.5倍 (18px程度) を使用
- 矢印は XML の先頭に配置 (最背面)
- 矢印とラベルは 20px 以上離す
- 日本語テキストの width は十分に確保 (1文字あたり 30-40px)
- 背景色は設定しない (透明)
- page="0" を設定
```

![image](https://ptera-publish.topaz.dev/project/01KCZFY7GBX8EVTB523FSJEW80.png)

## ゲーム

### カードゲーム

## QRメンコ詳細

## 指バンバン詳細 (Finger Bang Bang)

**「その指先が、最強の武器になる。」**

Webカメラと最新のAI技術を駆使した、没入型Web ARシューティングゲームです。
特別なコントローラーは不要。あなたの「手」だけで、仮想空間の敵を撃ち落とします。

### 🎮 ゲーム体験
画面の向こう側とこちら側が融合するAR（拡張現実）体験。
MediaPipeによる高速なハンドトラッキングにより、指先の微細な動きが遅延なくゲーム内に反映されます。
自分の手がそのまま銃になる、子供の頃の想像を具現化したようなプレイフィールを目指しました。

### 🕹️ 操作システム：ジェスチャー認識エンジン
単なる座標取得に留まらない、こだわりの操作ロジックを実装しています。

1.  **エイミング (Aiming)**
    *   人差し指の先端座標 (`Index_Finger_Tip`) をリアルタイム追跡。
    *   **スムージング処理**: 手の微細な震え（手ブレ）を抑制するため、生データに対して `Lerp (Linear Interpolation)` アルゴリズムを適用。30fpsのカメラ入力でも60fpsの滑らかなレティクル移動を実現しています。

2.  **シューティング (Shooting)**
    *   **ピストルジェスチャー**: 親指と人差し指でL字を作ると認識開始。
    *   **トリガー判定**: 親指の先端 (`Thumb_Tip`) と中指の付け根 (`Middle_Finger_MCP`) の距離を計算。
    *   **スケール不変性**: 手がカメラに近い時も遠い時も正確に判定するため、手のひらのサイズで正規化した比率 (`Ratio`) を用いて「トリガーを引く」動作を検知します。誤発射を防ぐ閾値調整済み。

### 🎯 ルール & システム
*   **Time Attack**: 制限時間**60秒**一本勝負。
*   **Dynamic Enemies**: 画面内をバウンドしながら予測不能な動きをするエネミー。
*   **Aim Assist**: 「当てやすさ」こそが「楽しさ」。厳密な当たり判定よりもプレイヤーの爽快感を優先し、照準が吸い付くようなエイムアシスト機能を搭載。

### 🛠️ 技術的なこだわり (Tech Highlights)

*   **⚡ High Performance Rendering (Three.js)**
    *   リッチな3D表現を行いつつも、Reactのレンダリングサイクルから独立したアニメーションループを構築。
    *   R3F (React Three Fiber) をあえて使わず、VanillaなThree.jsでメモリ管理とガベージコレクションを徹底制御し、低スペックなデバイスでも動作する軽量さを実現。

*   **🔊 Procedural Audio (Web Audio API)**
    *   **音声ファイルゼロ**。すべての効果音（射撃音、ヒット音）は、Web Audio APIのオシレーター（発振器）を使ってその場で合成。
    *   アセットのロード時間を削減すると同時に、状況に応じてピッチや減衰を動的に変化させるプロシージャルオーディオを採用。

*   **🧠 Edge AI**
    *   画像処理はすべてクライアントサイド（ブラウザ）で完結。サーバーへの画像送信は一切行わないため、プライバシーも安心かつ低遅延。

# これからの展望

<https://github.com/jyogi-web/2025_Ptera/issues>

- 経験値など育成要素
- カード物理印刷
