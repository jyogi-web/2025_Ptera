package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"google.golang.org/genai"
)

type CardSuggestions struct {
	Name        string `json:"name"`
	Faculty     string `json:"faculty"`
	Department  string `json:"department"`
	Grade       int32  `json:"grade"`
	Position    string `json:"position"`
	Hobby       string `json:"hobby"`
	Description string `json:"description"`
}

type GeminiService struct {
	client *genai.Client
}

const (
	imageDownloadTimeout = 30 * time.Second
	maxImageSize         = 10 * 1024 * 1024 // 10MB
	systemInstruction    = `You are an AI assistant that analyzes photos of people to create a profile card. You will be provided with an image and potentially some existing information (Name, Faculty, Department, Grade, Position, Hobby, Description). Your task is to generate values for these fields. If a field is already provided, you can either use it as is, or refine it to be more interesting/funny if appropriate, but prefer keeping the core meaning. If a field is missing, generate a creative, slightly biased or opinionated, and interesting value based on the person's appearance in the photo. The 'Description' should be a short, witty bio. Return ONLY a JSON object with keys: name, faculty, department, grade (integer), position, hobby, description. All string values must be in Japanese.`
)

func NewGeminiService(ctx context.Context, apiKey string) (*GeminiService, error) {
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create gemini client: %w", err)
	}

	return &GeminiService{
		client: client,
	}, nil
}

func (s *GeminiService) AnalyzeCardImage(ctx context.Context, imageURL string, currentName, currentFaculty, currentDepartment string, currentGrade int32, currentPosition, currentHobby, currentDescription string) (*CardSuggestions, error) {
	// 画像をダウンロード
	client := &http.Client{
		Timeout: imageDownloadTimeout,
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, imageURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch image: status code %d", resp.StatusCode)
	}

	limitedReader := io.LimitReader(resp.Body, maxImageSize)
	imageData, err := io.ReadAll(limitedReader)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}
	if len(imageData) == maxImageSize {
		return nil, fmt.Errorf("image size exceeds maximum allowed size of %d bytes", maxImageSize)
	}

	// MIMEタイプを特定
	detectedMime := http.DetectContentType(imageData)
	var mimeType string
	if strings.HasPrefix(detectedMime, "image/") {
		mimeType = detectedMime
	} else {
		headerMime := resp.Header.Get("Content-Type")
		headerMime = strings.TrimSpace(headerMime)
		mimeType = headerMime
	}
	if mimeType == "" || !strings.HasPrefix(mimeType, "image/") {
		mimeType = "image/jpeg"
	}

	promptText := fmt.Sprintf(`
				Name: %s
				Faculty: %s
				Department: %s
				Grade: %d
				Position: %s
				Hobby: %s
				Description: %s
			`, currentName, currentFaculty, currentDepartment, currentGrade, currentPosition, currentHobby, currentDescription)

	parts := []*genai.Part{
		{InlineData: &genai.Blob{
			MIMEType: mimeType,
			Data:     imageData,
		}},
		{Text: promptText},
	}

	contents := []*genai.Content{
		{
			Parts: parts,
		},
	}

	config := &genai.GenerateContentConfig{
		SystemInstruction: &genai.Content{
			Parts: []*genai.Part{
				{Text: systemInstruction},
			},
		},
		ResponseMIMEType: "application/json",
	}

	// modelはgemini-2.5-flashを使用する
	genResp, err := s.client.Models.GenerateContent(ctx, "gemini-2.5-flash", contents, config)
	if err != nil {
		return nil, fmt.Errorf("failed to generate content: %w", err)
	}

	if len(genResp.Candidates) == 0 || genResp.Candidates[0].Content == nil {
		return nil, fmt.Errorf("no content generated")
	}

	var suggestions CardSuggestions
	for _, part := range genResp.Candidates[0].Content.Parts {
		if part.Text != "" {
			jsonStr := part.Text
			jsonStr = strings.TrimPrefix(jsonStr, "```json")
			jsonStr = strings.TrimPrefix(jsonStr, "```")
			jsonStr = strings.TrimSuffix(jsonStr, "```")

			if err := json.Unmarshal([]byte(jsonStr), &suggestions); err != nil {
				// 純粋なJSONの場合に備えて、標準的なアンマーシャルを試みる
				if err2 := json.Unmarshal([]byte(part.Text), &suggestions); err2 != nil {
					return nil, fmt.Errorf("failed to unmarshal response: %w, text: %s", err, part.Text)
				}
			}
			return &suggestions, nil
		}
	}

	return nil, fmt.Errorf("no text part in response")
}

func (s *GeminiService) Close() error {
	// 新しいSDKのClientにはCloseメソッドがないか、http.Clientを共有しているため明示的なCloseが不要な場合があります。
	// 必要に応じて実装を確認しますが、現状はnilを返します。
	return nil
}
