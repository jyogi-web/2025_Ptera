# Ptera

# 完成品

デプロイ先
<https://2025-ptera.vercel.app/>

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

## アーキテクチャ

これはclaudecodeくんにdrawioで書いて若干修正してみました！
最近QiitaかZennで記事を見たので...

XMLでわりかしトークンを食う...?

```text
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

## 指バンバン詳細

# これからの展望

- ほげほげ
