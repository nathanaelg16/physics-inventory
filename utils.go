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

	pdf := gofpdf.New("P", "mm", "Letter", "")
	pdf.SetFont("Helvetica", "", 12)

	logo, err := resources.ReadFile("resources/logo-no-text.png")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return fmt.Errorf("unexpected error")
	}

	logoImgOptions := gofpdf.ImageOptions{
		ImageType: "png",
		ReadDpi:   true,
	}

	_ = pdf.RegisterImageOptionsReader("logo.png", logoImgOptions, bytes.NewReader(logo))

	hasErrors := false
	totalAssets := len(assetIDs)

	lineHeight := 7.0

	runtime.EventsEmit(a.ctx, "export-progress", 0.0)

	for i, id := range assetIDs {
		asset, err := a.GetAsset(id)
		if err != nil {
			hasErrors = true
			runtime.LogError(a.ctx, err.Error())
			runtime.EventsEmit(a.ctx, "export-progress", float64(i+1)/float64(totalAssets))
			continue
		}

		pdf.AddPage()

		pdf.ImageOptions("logo.png", 10, 10, 20, 20, true, logoImgOptions, 0, "")

		pdf.Ln(lineHeight)

		pdf.SetFont("Helvetica", "B", 14)
		pdf.Write(lineHeight, asset.Name.String)

		pdf.Ln(lineHeight)
		pdf.Ln(lineHeight)

		writeField(pdf, lineHeight, "Location", asset.Location.String)
		writeField(pdf, lineHeight, "Keywords", asset.Keywords.String)
		writeField(pdf, lineHeight, "Brand", asset.Brand.String)
		writeField(pdf, lineHeight, "Model", asset.Model.String)
		writeField(pdf, lineHeight, "Part #", asset.Part.String)
		writeField(pdf, lineHeight, "Serial Number", asset.Serial.String)
		writeField(pdf, lineHeight, "AU Inventory #", asset.AUInventory.String)
		writeField(pdf, lineHeight, "Quantity", asset.Quantity.String)
		writeField(pdf, lineHeight, "Notes", asset.Notes.String)

		pdf.Ln(lineHeight)

		writeField(pdf, lineHeight, "Repair Status", asset.RepairStatus.Expanded())
		writeField(pdf, lineHeight, "Status Change Date", formatDate(asset.StatusChangeDate, "N/A"))
		writeField(pdf, lineHeight, "Last Calibration Date", formatDate(asset.LastCalibrationDate, "N/A"))
		writeField(pdf, lineHeight, "Next Calibration Date", formatDate(asset.NextCalibrationDate, "N/A"))
		writeField(pdf, lineHeight, "Maintenance Notes", asset.MaintenanceNotes.String)

		imageType, err := determineMimeType(asset.Image)
		if err == nil {
			imgOptions := gofpdf.ImageOptions{
				ImageType: imageType,
				ReadDpi:   true,
			}
			if imageType == "tiff" {
				_ = tiff.RegisterReader(pdf, fmt.Sprintf("image-%d.%s", id, imageType), imgOptions, bytes.NewReader(asset.Image))
			} else {
				_ = pdf.RegisterImageOptionsReader(fmt.Sprintf("image-%d.%s", id, imageType), imgOptions, bytes.NewReader(asset.Image))
			}
			pdf.ImageOptions(fmt.Sprintf("image-%d.%s", id, imageType), 10, 100, 200, 200, false, imgOptions, 0, "")
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

func writeField(pdf *gofpdf.Fpdf, lineHeight float64, fieldName string, value string) {
	pdf.SetFont("Helvetica", "B", 12)
	pdf.Writef(lineHeight, "%s: ", fieldName)

	pdf.SetFont("Helvetica", "", 12)

	if len(value) == 0 {
		pdf.Write(lineHeight, "N/A")
	} else {
		pdf.Write(lineHeight, value)
	}

	pdf.Ln(lineHeight)
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
