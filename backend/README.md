# バックエンド

環境作成(docker)

```bash
docker compose up -d
```

ローカル実行

```bash
go run cmd/server/main.go
```

## ファイル構成例

```bash
├── backend/                # 【Go】バックエンド
│   ├── go.mod
│   ├── cmd/
│   │   └── server/
│   │       └── main.go     # エントリーポイント
│   ├── internal/           # ビジネスロジックなど
│   │   └── handler/        # gRPCハンドラーの実装
│   └── gen/                # 【自動生成】Go用コード (Git管理しても無視してもOK)
│       └── proto/
│           └── v1/
│               ├── user.pb.go
│               └── user_connect.pb.go
```
