package main

import (
	"bytes"
	"context"
	"database/sql"
	"embed"
	"encoding/csv"
	"encoding/hex"
	"fmt"
	"github.com/jung-kurt/gofpdf"
	"github.com/jung-kurt/gofpdf/contrib/tiff"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"strconv"
	"time"
)

//go:embed all:resources
var resources embed.FS

type FileType struct {
	displayName string
	pattern     string
}

var (
	PDF FileType = FileType{
		displayName: "PDF files (*.pdf)",
		pattern:     "*.pdf",
	}
	CSV FileType = FileType{
		displayName: "CSV files (*.csv)",
		pattern:     "*.csv",
	}
	Image FileType = FileType{
		displayName: "Images (*.png, *.jpg, *.tiff)",
		pattern:     "*.png;*.jpg;*.jpeg;*.tiff",
	}
)

func (a *App) SelectFile(fileType string) (string, error) {
	var displayName, pattern string

	if fileType == "document" {
		displayName = "PDF files (*.pdf)"
		pattern = "*.pdf"
	} else if fileType == "image" {
		displayName = "Images (*.png, *.jpg, *.tiff)"
		pattern = "*.png;*.jpg;*.jpeg;*.tiff"
	} else {
		return "", fmt.Errorf("invalid file type")
	}

	dialogOptions := runtime.OpenDialogOptions{
		Filters: []runtime.FileFilter{{
			DisplayName: displayName,
			Pattern:     pattern,
		}},
	}

	return runtime.OpenFileDialog(a.ctx, dialogOptions)
}

func chooseSaveFile(ctx *context.Context, fileType FileType, defaultFileName string) (string, error) {
	dialogOptions := runtime.SaveDialogOptions{
		DefaultFilename: defaultFileName,
		Filters: []runtime.FileFilter{{
			DisplayName: fileType.displayName,
			Pattern:     fileType.pattern,
		}},
	}

	return runtime.SaveFileDialog(*ctx, dialogOptions)
}

func (a *App) ExportAssetsCSV(assetIDs []int64) error {
	if len(assetIDs) == 0 {
		return fmt.Errorf("no asset(s) found to export")
	}

	currDate := time.Now().Format("0601020304")
	fileName, err := chooseSaveFile(&a.ctx, CSV, fmt.Sprintf("assets-%s.csv", currDate))
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return err
	}

	// this can happen when the user cancels the save dialog, according to the Wails docs
	if len(fileName) == 0 {
		runtime.LogInfo(a.ctx, "user canceled save dialog")
		return nil
	}

	file, err := os.Create(fileName)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return err
	}
	defer file.Close()

	hasErrors := false

	writer := csv.NewWriter(file)
	defer writer.Flush()

	err = writer.Write([]string{
		"ID", "Name", "Location", "Keywords", "Brand", "Model", "Part #",
		"Serial Number", "AU Inventory #", "Quantity", "Vendor", "Purchase Date",
		"Purchase Amount", "Unit Price", "Receipt Available", "Record #",
		"Digital Manual Available", "Physical Manual Available", "Missing",
		"Quantity Missing", "Date Reported Missing", "Reported Missing By", "Notes",
		"Repair Status", "Status Change Date", "Last Calibration Date",
		"Next Calibration Date", "Maintenance Notes"})
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		hasErrors = true
	}

	totalAssets := len(assetIDs)

	runtime.EventsEmit(a.ctx, "export-progress", 0.0)
	defer runtime.EventsEmit(a.ctx, "export-progress", 1.0)

	for i, id := range assetIDs {
		asset, err := a.GetAsset(id)
		if err != nil {
			hasErrors = true
			runtime.LogError(a.ctx, err.Error())
			runtime.EventsEmit(a.ctx, "export-progress", float64(i+1)/float64(totalAssets))
			continue
		}

		err = writer.Write([]string{
			strconv.FormatInt(asset.Id, 10),
			asset.Name.String,
			asset.Location.String,
			asset.Keywords.String,
			asset.Brand.String,
			asset.Model.String,
			asset.Part.String,
			asset.Serial.String,
			asset.AUInventory.String,
			asset.Quantity.String,
			asset.Vendor,
			formatDate(asset.PurchaseDate, ""),
			asset.PurchaseAmount.String,
			asset.UnitPrice,
			formatBool(asset.ReceiptAvailable),
			formatRecordLocator(asset.RecordLocator),
			formatBool(asset.SoftCopyAvailable),
			formatBool(asset.HardCopyAvailable),
			formatBool(asset.Missing),
			asset.QuantityMissing.String,
			formatDate(asset.DateReportedMissing, ""),
			asset.ReportedMissingBy.String,
			asset.Notes.String,
			asset.RepairStatus.Expanded(),
			formatDate(asset.StatusChangeDate, ""),
			formatDate(asset.LastCalibrationDate, ""),
			formatDate(asset.NextCalibrationDate, ""),
			asset.MaintenanceNotes.String,
		})

		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			hasErrors = true
		}

		runtime.EventsEmit(a.ctx, "export-progress", float64(i+1)/float64(totalAssets))
	}

	writer.Flush()

	if hasErrors {
		return fmt.Errorf("operation completed with errors")
	}

	return nil
}

func (a *App) initializePDF() (*gofpdf.Fpdf, error) {
	// Create PDF with letter size in portrait orientation
	pdf := gofpdf.New("P", "mm", "Letter", "")

	// Set up default margins (left, top, right)
	pdf.SetMargins(15, 15, 15)

	// Enable auto page breaks
	pdf.SetAutoPageBreak(true, 15)

	// Register logo
	logo, err := resources.ReadFile("resources/logo-no-text.png")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, fmt.Errorf("unexpected error")
	}

	logoImgOptions := gofpdf.ImageOptions{
		ImageType: "png",
		ReadDpi:   true,
	}

	_ = pdf.RegisterImageOptionsReader("logo.png", logoImgOptions, bytes.NewReader(logo))

	// Add a header to each page
	pdf.SetHeaderFunc(func() {
		// Add logo
		pdf.ImageOptions("logo.png", 15, 10, 20, 0, false, gofpdf.ImageOptions{}, 0, "")

		// Add title
		pdf.SetFont("Helvetica", "B", 14)
		pdf.SetTextColor(203, 182, 119)
		pdf.SetXY(40, 15)
		pdf.Cell(0, 10, "Physics Inventory")

		// Add date
		pdf.SetFont("Helvetica", "I", 10)
		pdf.SetTextColor(0, 0, 0)
		pdf.SetXY(150, 15)
		pdf.Cell(45, 10, "Generated: "+time.Now().Format("Jan 2, 2006"))

		// Add a line separator
		pdf.Ln(15)
	})

	// Add a footer with page numbers
	pdf.SetFooterFunc(func() {
		pdf.SetY(-15)
		pdf.SetFont("Helvetica", "I", 8)
		pdf.Cell(0, 10, fmt.Sprintf("Page %d", pdf.PageNo()))
	})

	return pdf, nil
}

func (a *App) ExportAssetsPDF(assetIDs []int64) error {
	if len(assetIDs) == 0 {
		return fmt.Errorf("no asset(s) found to export")
	}

	currDate := time.Now()
	defaultFileName := fmt.Sprintf("assets-%s.pdf", currDate.Format("0601020304"))

	if len(assetIDs) == 1 {
		assetName, err := getAssetName(a, assetIDs[0])
		if err != nil {
			return err
		}
		defaultFileName = fmt.Sprintf("%s-%s.pdf", assetName, currDate.Format("0601020304"))
	}

	fileName, err := chooseSaveFile(&a.ctx, PDF, defaultFileName)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return err
	}

	// this can happen when the user cancels the save dialog, according to the Wails docs
	if len(fileName) == 0 {
		runtime.LogInfo(a.ctx, "user canceled save dialog")
		return nil
	}

	pdf, err := a.initializePDF()
	if err != nil {
		return err
	}

	hasErrors := false
	totalAssets := len(assetIDs)

	// Standard line height calculations
	baseLineHeight := 6.0
	sectionSpacing := 8.0

	runtime.EventsEmit(a.ctx, "export-progress", 0.0)
	defer runtime.EventsEmit(a.ctx, "export-progress", 1.0)

	for i, id := range assetIDs {
		asset, err := a.GetAsset(id)
		if err != nil {
			hasErrors = true
			runtime.LogError(a.ctx, err.Error())
			runtime.EventsEmit(a.ctx, "export-progress", float64(i+1)/float64(totalAssets))
			continue
		}

		pdf.AddPage()

		// Asset Title
		pdf.SetFont("Helvetica", "B", 16)
		pdf.SetTextColor(0, 51, 102) // Dark blue for titles
		pdf.CellFormat(0, 10, asset.Name.String, "", 1, "C", false, 0, "")
		pdf.Ln(sectionSpacing)

		// Reset text color to black
		pdf.SetTextColor(0, 0, 0)

		// Create a main details section
		pdf.SetFont("Helvetica", "B", 12)
		pdf.Cell(45, baseLineHeight, "Main Details")
		pdf.Ln(baseLineHeight * 1.2)

		startY := pdf.GetY()

		// First column
		col1Width := 85.0
		currentY := startY + 2

		// Function to write a field in the info box
		writeInfoField := func(label, value string, col int) {
			startX := 15 + float64(col)*(col1Width+10)

			pdf.SetFont("Helvetica", "B", 10)
			pdf.SetXY(startX, currentY)
			pdf.Cell(30, baseLineHeight, label+":")

			pdf.SetFont("Helvetica", "", 10)
			pdf.SetXY(startX+30, currentY)
			if len(value) == 0 {
				pdf.Cell(col1Width-30, baseLineHeight, "N/A")
			} else {
				pdf.Cell(col1Width-30, baseLineHeight, value)
			}

			if col == 1 {
				currentY += baseLineHeight * 1.2
			}
		}

		// Draw border for Main Details section
		pdf.SetDrawColor(200, 200, 200)   // Light gray for borders
		pdf.Line(15, startY, 195, startY) // Top border

		// Write fields
		writeInfoField("Location", asset.Location.String, 0)
		writeInfoField("Brand", asset.Brand.String, 1)
		writeInfoField("Model", asset.Model.String, 0)
		writeInfoField("Part #", asset.Part.String, 1)
		writeInfoField("Serial #", asset.Serial.String, 0)
		writeInfoField("AU Inventory #", asset.AUInventory.String, 1)

		// Add Keywords field
		pdf.SetFont("Helvetica", "B", 10)
		pdf.SetXY(15, currentY)
		pdf.Cell(30, baseLineHeight, "Keywords:")

		// Handle multiline text for keywords
		if len(asset.Keywords.String) > 0 {
			// Save current position
			keywordsStartY := currentY
			pdf.SetXY(45, currentY)

			// Add the keywords text
			pdf.SetFont("Helvetica", "", 10)
			pdf.MultiCell(145, baseLineHeight, asset.Keywords.String, "", "", false)

			// Update the current Y position
			width := 145.0
			lines := pdf.SplitLines([]byte(asset.Keywords.String), width)
			keywordsTextHeight := float64(len(lines)) * baseLineHeight
			currentY = keywordsStartY + keywordsTextHeight + (baseLineHeight * 0.5)
		} else {
			pdf.SetXY(45, currentY)
			pdf.SetFont("Helvetica", "", 10)
			pdf.Cell(145, baseLineHeight, "N/A")
			currentY += baseLineHeight * 1.2
		}

		// Add Notes field
		pdf.SetFont("Helvetica", "B", 10)
		pdf.SetXY(15, currentY)
		pdf.Cell(30, baseLineHeight, "Notes:")

		// Handle multiline text for notes
		if len(asset.Notes.String) > 0 {
			// Save current position
			notesStartY := currentY
			pdf.SetXY(45, currentY)

			// Add the notes text
			pdf.SetFont("Helvetica", "", 10)
			pdf.MultiCell(145, baseLineHeight, asset.Notes.String, "", "", false)

			// Update the currentY position
			width := 145.0
			lines := pdf.SplitLines([]byte(asset.Notes.String), width)
			notesTextHeight := float64(len(lines)) * baseLineHeight
			currentY = notesStartY + notesTextHeight + (baseLineHeight * 1.2)
		} else {
			pdf.SetXY(45, currentY)
			pdf.SetFont("Helvetica", "", 10)
			pdf.Cell(145, baseLineHeight, "N/A")
			currentY += baseLineHeight * 1.2
		}

		pdf.SetY(currentY + 5)

		// Maintenance section with table
		pdf.SetFont("Helvetica", "B", 12)
		pdf.Cell(45, baseLineHeight, "Maintenance Information")
		pdf.Ln(baseLineHeight * 1.2)

		// Draw border for Maintenance Information section
		maintenanceStartY := pdf.GetY()
		pdf.SetDrawColor(200, 200, 200)                         // Light gray for borders
		pdf.Line(15, maintenanceStartY, 195, maintenanceStartY) // Top border
		pdf.Ln(baseLineHeight / 2)

		pdf.SetFillColor(220, 220, 220)
		pdf.SetFont("Helvetica", "B", 10)

		// Table header
		pdf.Cell(45, baseLineHeight, "Status")
		pdf.Cell(45, baseLineHeight, "Changed On")
		pdf.Cell(45, baseLineHeight, "Last Calibration")
		pdf.Cell(45, baseLineHeight, "Next Calibration")
		pdf.Ln(baseLineHeight)

		// Table data
		pdf.SetFont("Helvetica", "", 10)
		pdf.Cell(45, baseLineHeight, asset.RepairStatus.Expanded())
		pdf.Cell(45, baseLineHeight, formatDate(asset.StatusChangeDate, "N/A"))
		pdf.Cell(45, baseLineHeight, formatDate(asset.LastCalibrationDate, "N/A"))
		pdf.Cell(45, baseLineHeight, formatDate(asset.NextCalibrationDate, "N/A"))
		pdf.Ln(baseLineHeight)

		maintenanceCurrentY := pdf.GetY()

		// Maintenance notes
		if len(asset.MaintenanceNotes.String) > 0 {
			pdf.SetFont("Helvetica", "B", 10)
			pdf.Cell(45, baseLineHeight, "Maintenance Notes:")
			pdf.Ln(baseLineHeight)
			pdf.SetFont("Helvetica", "", 10)

			// Save current position for height calculation
			pdf.MultiCell(180, baseLineHeight, asset.MaintenanceNotes.String, "", "", false)

			// Update current Y position after maintenance notes
			maintenanceCurrentY = pdf.GetY()
		}

		// Image section
		imageType, err := determineMimeType(asset.Image)
		if err == nil && len(asset.Image) > 0 {
			// Calculate how much space we need for the image and header
			imgWidth := 140.0
			imgHeight := 100.0
			imgHeaderHeight := baseLineHeight + (baseLineHeight * 1.2) + 5 // Section title + line break + some padding
			totalImageSectionHeight := imgHeaderHeight + imgHeight + 15    // Image + footer space

			// Check if we have enough space on the current page
			// Letter size is 279.4 mm height, but we need to account for margins
			currentY := pdf.GetY()
			pageHeight := 279.4  // Letter height in mm
			bottomMargin := 15.0 // Bottom margin in mm
			remainingSpace := pageHeight - currentY - bottomMargin

			// If we don't have enough space, add a new page
			if remainingSpace < totalImageSectionHeight {
				pdf.AddPage()
				// Reset Y position after adding a new page
				maintenanceCurrentY = pdf.GetY()
			} else {
				// Otherwise, add some spacing after the maintenance section
				pdf.SetY(maintenanceCurrentY + sectionSpacing)
				maintenanceCurrentY = pdf.GetY()
			}

			// Add image section header
			pdf.SetFont("Helvetica", "B", 12)
			pdf.Cell(45, baseLineHeight, "Asset Image")
			pdf.Ln(baseLineHeight * 1.2)

			// Draw border for Asset Image section
			imageStartY := pdf.GetY() - (baseLineHeight * 0.2)
			pdf.SetDrawColor(200, 200, 200)             // Light gray for borders
			pdf.Line(15, imageStartY, 195, imageStartY) // Top border

			imgOptions := gofpdf.ImageOptions{
				ImageType: imageType,
				ReadDpi:   true,
			}

			// Handle TIFF images differently
			if imageType == "tiff" {
				_ = tiff.RegisterReader(pdf, fmt.Sprintf("image-%d.%s", id, imageType), imgOptions, bytes.NewReader(asset.Image))
			} else {
				_ = pdf.RegisterImageOptionsReader(fmt.Sprintf("image-%d.%s", id, imageType), imgOptions, bytes.NewReader(asset.Image))
			}

			// Center the image horizontally
			xPos := (210 - imgWidth) / 2
			pdf.ImageOptions(fmt.Sprintf("image-%d.%s", id, imageType), xPos, pdf.GetY(), imgWidth, imgHeight, false, imgOptions, 0, "")
		}

		runtime.EventsEmit(a.ctx, "export-progress", float64(i+1)/float64(totalAssets))
	}

	err = pdf.OutputFileAndClose(fileName)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return err
	}

	if hasErrors {
		return fmt.Errorf("operation completed with errors")
	}

	return nil
}

func formatDate(date sql.NullTime, defaultValue string) string {
	if date.Valid {
		return date.Time.Format("2006-01-02")
	} else {
		return defaultValue
	}
}

func formatBool(b bool) string {
	if b {
		return "Y"
	} else {
		return "N"
	}
}

func formatRecordLocator(recordLocator int64) string {
	if recordLocator == -1 {
		return ""
	}

	return strconv.FormatInt(recordLocator, 10)
}

// determineMimeType determines the MIME type of a file based on its byte signature
func determineMimeType(byteArray []byte) (string, error) {
	// Ensure we have at least 4 bytes to check
	if len(byteArray) < 4 {
		return "", fmt.Errorf("byte array too short to determine MIME type: got %d bytes, need at least 4", len(byteArray))
	}

	// Convert the first 4 bytes to a hex string
	header := hex.EncodeToString(byteArray[:4])

	switch header {
	case "89504e47":
		return "png", nil // PNG signature
	case "ffd8ffe0", "ffd8ffe1", "ffd8ffe2":
		return "jpg", nil // JPEG signature
	case "49492a00", "4d4d002a":
		return "tiff", nil // TIFF signatures (little-endian and big-endian)
	default:
		return "", fmt.Errorf("unsupported image format with signature: %s", header)
	}
}
