package main

import (
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"log"
	"os"
	"time"
)

// FileLogger is a utility to log messages to a file
type FileLogger struct {
	filename string
}

// NewFileLogger creates a new Logger.
func NewFileLogger(filename string) logger.Logger {
	f, err := os.OpenFile(filename, os.O_TRUNC|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		log.Printf("Failed to truncate/create log file %s: %v", filename, err)
	} else {
		f.Close()
	}

	return &FileLogger{
		filename: filename,
	}
}

func (l *FileLogger) Print(message string) {
	f, err := os.OpenFile(l.filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return
	}
	defer f.Close()

	timestamp := time.Now().Format(time.DateTime)

	// log to stdout
	log.Print(message)

	// log to file
	f.WriteString(fmt.Sprintf("%s | %s", timestamp, message))
}

func (l *FileLogger) Println(message string) {
	l.Print(message + "\n")
}

// Trace level logging.
func (l *FileLogger) Trace(message string) {
	l.Println("TRACE | " + message)
}

// Debug level logging.
func (l *FileLogger) Debug(message string) {
	l.Println("DEBUG | " + message)
}

// Info level logging.
func (l *FileLogger) Info(message string) {
	l.Println("INFO  | " + message)
}

// Warning level logging.
func (l *FileLogger) Warning(message string) {
	l.Println("WARN  | " + message)
}

// Error level logging.
func (l *FileLogger) Error(message string) {
	l.Println("ERROR | " + message)
}

// Fatal level logging.
func (l *FileLogger) Fatal(message string) {
	l.Println("FATAL | " + message)
	os.Exit(1)
}
