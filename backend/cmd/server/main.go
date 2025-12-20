package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/reflection"
	"google.golang.org/grpc/status"

	"github.com/jyogi-web/2025_Ptera/backend/pkg/ai"
	ptera "github.com/jyogi-web/2025_Ptera/backend/pkg/grpc/ptera/v1"
)

const (
	defaultPort = 50051
)

type server struct {
	ptera.UnimplementedPteraServiceServer
	mu        sync.RWMutex
	users     map[string]*ptera.User
	aiService *ai.GeminiService
}

func main() {
	if err := run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}

func run() error {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("GEMINI_API_KEY environment variable is not set")
	}

	// Create Gemini service with a background context (or separate context if manageable)
	// Note: In a real app, we might want to handle cancellation if main stops, but for now bg is fine for init.
	geminiService, err := ai.NewGeminiService(context.Background(), apiKey)
	if err != nil {
		return fmt.Errorf("failed to create gemini service: %w", err)
	}
	defer geminiService.Close()

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", defaultPort))
	if err != nil {
		return fmt.Errorf("failed to listen: %w", err)
	}

	grpcServer := grpc.NewServer()
	ptera.RegisterPteraServiceServer(grpcServer, &server{
		users:     make(map[string]*ptera.User),
		aiService: geminiService,
	})
	reflection.Register(grpcServer)

	go func() {
		log.Printf("server listening at %v", lis.Addr())
		if err := grpcServer.Serve(lis); err != nil {
			log.Printf("failed to serve: %v", err)
			return
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down server...")
	grpcServer.GracefulStop()
	log.Println("server stopped")

	return nil
}

func (s *server) CompleteCard(ctx context.Context, req *ptera.CompleteCardRequest) (*ptera.CompleteCardResponse, error) {
	if req.ImageUrl == "" {
		return nil, status.Error(codes.InvalidArgument, "image_url is required")
	}

	// Use getters to safely handle optional fields (returns "" if nil)

	suggestions, err := s.aiService.AnalyzeCardImage(
		ctx,
		req.GetImageUrl(),
		req.GetName(),
		req.GetFaculty(),
		req.GetDepartment(),
		req.GetGrade(),
		req.GetPosition(),
		req.GetHobby(),
		req.GetDescription(),
	)
	if err != nil {
		log.Printf("failed to analyze card image: %v", err)
		return nil, status.Error(codes.Internal, "failed to analyze image")
	}

	return &ptera.CompleteCardResponse{
		Name:        &suggestions.Name,
		Faculty:     &suggestions.Faculty,
		Department:  &suggestions.Department,
		Grade:       &suggestions.Grade,
		Position:    &suggestions.Position,
		Hobby:       &suggestions.Hobby,
		Description: &suggestions.Description,
		Success:     true,
	}, nil
}
