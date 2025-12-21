# Ptera

# 完成品

デプロイ先
<https://2025-ptera.vercel.app>

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

### lefthook

めちゃくちゃフォーマットかけ忘れマンなのでpre-commitを導入しました〜

pre-commitの管理にはLefthookを導入してみて、結構楽に導入できたとという印象です
<https://qiita.com/KOU050223/items/35cfaedefad2bc88a89d>

### ほげほげ

## アーキテクチャ

![image](https://ptera-publish.topaz.dev/project/01KCZFY7GBX8EVTB523FSJEW80.png)

## プロトコルバッファーでの生成

![image](https://ptera-publish.topaz.dev/project/01KCZG1EJ12G21WVHJRQADGA8V.png)

# これからの展望
