# Ptera

# 完成品

デプロイ先
<https://2025-ptera.vercel.app/>

# 【アプリ概要】

サークルの部員をカード化してコレクションできます
写真を撮って情報を入力するとカード化して保存
対戦機能も実装、QRコードでミニゲーム可能です

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

## 使用技術

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

### gRPCを用いたバックエンド

gRPCを用いたgoのバックエンドを構築しました

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

## ゲーム詳細

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
