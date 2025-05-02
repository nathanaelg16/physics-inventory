package main

import (
	"context"
	"database/sql"
	"encoding/csv"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"strconv"
	"time"
)

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
