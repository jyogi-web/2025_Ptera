# Ptera

# 完成品

デプロイ先
<https://2025-ptera.vercel.app/>

デモ動画

<https://youtu.be/GJS2rUClz1g>
<https://youtu.be/9JDHDLAv9u4>

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

protoファイルでのサービスの定義は以下の通りです

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

### プロトコルバッファでの生成

プロトコルバッファを用いて、共通の型定義を生成します

今回はprotocではなく[buf](https://github.com/bufbuild/buf)を使用して生成しました。

↓参考

- <https://zenn.dev/thirdlf/articles/27-zenn-grpc-golang>
- <https://zenn.dev/hsaki/books/golang-grpc-starting>
- <https://zenn.dev/jy8752/books/33743f8091c39d>

#### プロトコルバッファのメリット

- バックエンドとフロントエンドで共通の型定義を生成
- HTTP/2を使用して高速！
- 複数言語のファイルへの出力が可能(golang, typescript, python, java, ...)
- [bufプラグイン](https://buf.build/plugins/protobuf)を使用して生成

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

### カードゲーム詳細

**「仲間がカードになる。サークルの絆で戦え。」**

サークルメンバーをカード化し、リアルタイムで対戦できる本格的なターン制カードバトルゲームです。
生成したメンバーカードで、サークル対抗の熱いバトルを繰り広げましょう。

#### カード生成システム：プロフィール作成

カード作成は誰でも簡単。写真を撮るだけでAIが自動的にプロフィールを生成します。

1. **写真撮影**
2. **AI自動解析 (Gemini 2.5 Flash)**
   - 画像から人物の特徴を読み取り
   - 名前、学部、学科、学年、役職、趣味、説明文を自動生成
   - システムプロンプトにより、サークルメンバーらしいプロフィールを作成

3. **カスタマイズ**
   - AI生成結果を自由に編集可能
   - お気に入り登録で「推しメン」を設定

#### ⚔️ バトルシステム：ターン制の戦略バトル

**基本ルール**

- 各サークルから5枚のデッキを自動構築
- 1枚が「アクティブ」、残り4枚が「ベンチ」
- ターン制で交互に行動
- 先に3枚倒されたサークルが敗北

**アクション**

- **攻撃**: アクティブカードで相手に攻撃（攻撃力の0.9~1.1倍のランダムダメージ）
- **交代**: アクティブカードをベンチと入れ替え（戦略的なカード管理が重要）

**カードステータス**

- **HP**: カードの耐久力（0になると戦闘不能）
- **攻撃力**: 与えるダメージの基準値
- ステータスは学年とカードIDから決定論的に生成（公平性を保証）

#### マッチングシステム：サークル対抗戦

1. **バトルリクエスト送信**
   - 対戦したいサークルを選択してリクエスト送信
   - リクエストはFirestoreにリアルタイム保存

2. **マッチング成立**
   - 相手サークルがリクエストを承認
   - 両サークルのカードプールから5枚ずつランダム選出
   - バトル状態を初期化

3. **リアルタイムバトル**
   - Firestoreのリアルタイムリスナーで状態同期
   - 両プレイヤーが同じバトル状態を共有
   - ターンごとにバトルログを記録

#### 技術の話

- **リアルタイム同期 (Firestore Realtime Listener)**
- **決定論的ステータス生成**

- **gRPC/Connect RPC**
  - Protocol Buffersによる型安全なAPI通信
  - フロントエンドとバックエンドで共通の型定義
  - HTTP/2による高速通信

- **AI統合 (Gemini API)**
  - サーバーサイドで画像解析を実行
  - プライバシーに配慮したセキュアな処理
  - レスポンス時間の最適化

- **レスポンシブUI (@arwes/react)**
  - サイバーパンク風のSF的な世界観
  - アニメーション豊富な没入型インターフェース
  - モバイル・デスクトップ両対応

#### 戦略のポイント

- **デッキ編成**: どのカードがデッキに選ばれるかは運次第。メンバーを増やして選択肢を広げよう
- **交代タイミング**: HPが減ったカードを温存し、ベンチと入れ替えて戦況を立て直す
- **攻撃のタイミング**: ダメージにランダム性があるため、運も味方につけて
- **サークル全体の強さ**: メンバー全員をカード化して、強力なカードプールを構築

## QRメンコ詳細

刹那のメンコです。
参考は、某ゲームの「刹那の見切り」が参考ですね。

過去スマホでやってるチームもいたし、ボタンじゃ面白くないなーっで、「ほな、メンコでやるかー」でメンコです。
主に以下のライブラリを使い実装

```json
"jsqr": "^1.4.0",
```

QRコードを事前に生成して、その決め打ちの値を読み取り続けてます。
あるタイミングで！マークが出て、メンコを投げてひっくり返します（そーゆう遊びの想定です。ズルはだめだぞ★）
！マークからメンコをひっくり返す時間を競う形です。
特定のメンコが読み取れなかった場合は、ゲームはできません

特に難しい処理は、特にありません。シンプルISベスト
ほんとだったら、４人対戦とかしてーなーっで想定していたんですが時間が...(他の実装が...卒研が...引っ越しが...)

メンコは過去の遺産です
[参考](https://topaz.dev/projects/196c1bc527bd4bc8dd7e)

色々想定して、いろんなもの持ってきたんですが、あまり出番はなかったですね。
周辺施設にコピー機がないので、サーマルプリンターで繋いで新しいQRコードやらなんやらを発行しようとしていました
![image](https://ptera-publish.topaz.dev/project/01KCZNXX6YSQ49P9TPYMVFCTRT.jpeg)

## 指バンバン詳細

なんかTwitterでGemini3を用いて、指を使って遊ぶシューティングゲームを作っていたので、自分も真似して作ってみました。

参考 : <https://x.com/satori_sz9/status/20014808853429986>

遊び方はシンプルで、画面上で的が動き回っているので、指でピストルの形を作ってエイムを合わせ、ここぞというタイミングでピストルを撃つモーションをするだけです。

![image](https://ptera-publish.topaz.dev/project/01KCZPKJZTD6GWAQCN7C24DMDJ.png)

MediaPipeを使ったハンドトラッキングと、Three.jsを使った3D表現で実装しました。Windowsだとちょっと重たいけど、Macだとサクサク動いてくれます。(チューニング結構頑張った。)

60FPSを維持するために、JavaScriptのガベージコレクションを発生させないように工夫しました。

```
// 該当するコード

// 定義部分:ループ内で new THREE.Vector3() しないように事前に確保
const gameRef = useRef({
  // ...
  tempVec3: new THREE.Vector3(),   // 計算用一時バッファ1
  tempVec3_2: new THREE.Vector3(), // 計算用一時バッファ2
  tempVec3_3: new THREE.Vector3(), // 計算用一時バッファ3
});

// ゲームループ内での使用
const { tempVec3, tempVec3_2 } = gameRef.current; // 参照を取り出すだけ

// AIの認識結果(カクつきやすい)を線形補間(Lerp)で滑らかにする
// 第2引数の0.35が「追従性」と「滑らかさ」のバランス係数
gesture.smoothAimPosition.lerp(gesture.aimPosition, 0.35 * timeScale);
```

よく耳を澄まして聞いてみると、「ピュン!」「ポーン!」みたいな
SEが聞こえます。これはどっかから拾ってきたわけではなく、AudioContext と Oscillator を使い、矩形波(Square)や正弦波(Sine)の周波数を時間変化させて出力してます。(なんて無駄な.....)

```
// 該当してるコード

const playSound = useCallback((type: "shoot" | "hit") => {
  const ctx = gameRef.current.audioCtx;
  if (!ctx) return;

  const osc = ctx.createOscillator(); // 発振器(音の源)を作成
  const gain = ctx.createGain();      // 音量制御ノード
  osc.connect(gain);
  gain.connect(ctx.destination);      // スピーカーへ接続

  if (type === "shoot") {
    osc.type = "square"; // 矩形波(ファミコンのような音)
    // 周波数を 400Hz から 100Hz へ 0.1秒かけて急激に下げる(ピュン!)
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    // 音量を減衰させる(エンベロープ)
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }
  // ...
}, []);

```

画面左下のカメラで認識されてるのが確認できるよ。

![image](https://ptera-publish.topaz.dev/project/01KCZQ1X2NZQ5Z19YGPNCR9WQZ.png)

モーションの認識のロジック

```
// 1. 手の大きさ(スケール)を測る:手首(0)から人差し指の付け根(5)までの距離
const scale = Math.hypot(
  indexMCP.x - wrist.x,
  indexMCP.y - wrist.y,
);

// 2. ピンチ動作の距離を測る:親指の先(4)と中指の第2関節(9)の距離
const dist = Math.hypot(
  landmarks[4].x - landmarks[9].x,
  landmarks[4].y - landmarks[9].y,
);

// 3. 単純な dist ではなく、スケールで割った「比率」で判定する
// これにより、手がカメラから離れて小さくなっても判定閾値(0.75)を変えずに済む
const ratio = dist / (scale || 1);
const isTrigger = ratio < TRIGGER_THRESHOLD; // 0.75
```

# これからの展望

<https://github.com/jyogi-web/2025_Ptera/issues>

- 経験値など育成要素
- カード物理印刷
