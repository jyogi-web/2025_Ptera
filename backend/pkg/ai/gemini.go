package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type CardSuggestions struct {
	Name        string `json:"name"`
	Faculty     string `json:"faculty"`
	Department  string `json:"department"`
	Grade       string `json:"grade"`
	Position    string `json:"position"`
	Hobby       string `json:"hobby"`
	Description string `json:"description"`
}

type GeminiService struct {
	client *genai.Client
	model  *genai.GenerativeModel
}

func NewGeminiService(ctx context.Context, apiKey string) (*GeminiService, error) {
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create gemini client: %w", err)
	}

	// modelはgemini-2.5-flashを使用する
	model := client.GenerativeModel("gemini-2.5-flash")
	model.ResponseMIMEType = "application/json"
	model.SystemInstruction = genai.NewUserContent(genai.Text("You are an AI assistant that analyzes photos of people to create a profile card. You will be provided with an image and potentially some existing information (Name, Faculty, Department, Grade, Position, Hobby, Description). Your task is to generate values for these fields. If a field is already provided, you can either use it as is, or refine it to be more interesting/funny if appropriate, but prefer keeping the core meaning. If a field is missing, generate a creative, slightly biased or opinionated, and interesting value based on the person's appearance in the photo. The 'Description' should be a short, witty bio. Return ONLY a JSON object with keys: name, faculty, department, grade, position, hobby, description."))

	return &GeminiService{
		client: client,
		model:  model,
	}, nil
}

func (s *GeminiService) AnalyzeCardImage(ctx context.Context, imageURL string, currentName, currentFaculty, currentDepartment, currentGrade, currentPosition, currentHobby, currentDescription string) (*CardSuggestions, error) {
	// 画像をダウンロード
	resp, err := http.Get(imageURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetching image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch image: status code %d", resp.StatusCode)
	}

	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}

	// MIMEタイプを特定
	// 1. コンテンツから検出を試みる（JPEG/PNGなどの標準的な形式に最も信頼性が高い）
	// http.DetectContentType はデータの最初の512バイトを検査する。
	detectedMime := http.DetectContentType(imageData)

	var mimeType string
	if strings.HasPrefix(detectedMime, "image/") {
		mimeType = detectedMime
	} else {
		// 検出に失敗した場合（例：HEICはGoの標準ライブラリで検出されない可能性がある）、ヘッダーにフォールバックする
		headerMime := resp.Header.Get("Content-Type")
		headerMime = strings.TrimSpace(headerMime)
		mimeType = headerMime
	}
	// 最終的な安全策としてのフォールバック
	if mimeType == "" || !strings.HasPrefix(mimeType, "image/") {
		mimeType = "image/jpeg"
	}

	promptParts := []genai.Part{
		genai.Blob{
			MIMEType: mimeType,
			Data:     imageData,
		},
		genai.Text(fmt.Sprintf("Current Data:\nName: %s\nFaculty: %s\nDepartment: %s\nGrade: %s\nPosition: %s\nHobby: %s\nDescription: %s\n\nPlease generate/complete the profile.", currentName, currentFaculty, currentDepartment, currentGrade, currentPosition, currentHobby, currentDescription)),
	}

	genResp, err := s.model.GenerateContent(ctx, promptParts...)
	if err != nil {
		return nil, fmt.Errorf("failed to generate content: %w", err)
	}

	if len(genResp.Candidates) == 0 || genResp.Candidates[0].Content == nil {
		return nil, fmt.Errorf("no content generated")
	}

	var suggestions CardSuggestions
	for _, part := range genResp.Candidates[0].Content.Parts {
		if txt, ok := part.(genai.Text); ok {
			// もしあれば、潜在的なMarkdownコードブロックをクリーンアップする（ResponseMIMEType jsonで処理されるはずだが）
			jsonStr := string(txt)
			jsonStr = strings.TrimPrefix(jsonStr, "```json")
			jsonStr = strings.TrimPrefix(jsonStr, "```")
			jsonStr = strings.TrimSuffix(jsonStr, "```") // 堅牢ではないが、通常はJSONモードで処理される

			if err := json.Unmarshal([]byte(jsonStr), &suggestions); err != nil {
				// 純粋なJSONの場合に備えて、標準的なアンマーシャルを試みる
				if err2 := json.Unmarshal([]byte(string(txt)), &suggestions); err2 != nil {
					return nil, fmt.Errorf("failed to unmarshal response: %w, text: %s", err, string(txt))
				}
			}
			return &suggestions, nil
		}
	}

	return nil, fmt.Errorf("no text part in response")
}

func (s *GeminiService) Close() {
	s.client.Close()
}
