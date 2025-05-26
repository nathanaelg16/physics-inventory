package main

import (
	"database/sql"
	"encoding/csv"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"strconv"
	"time"
)

type CollectionRecord struct {
	Id            int64          `json:"id"`
	Name          sql.NullString `json:"name"`
	Location      sql.NullString `json:"location"`
	Serial        sql.NullString `json:"serial"`
	RecordLocator int64          `json:"recordLocator"`
	AssociatedBy  string         `json:"associatedBy"`
}

func (a *App) ExportSetCSV(setID int64) error {
	setName, err := a.GetSetName(setID)
	if err != nil {
		setName = "set"
	}

	setRecords, err := a.GetSetRecords(setID)
	if err != nil {
		return err
	}

	return a.exportCollectionCSV(setName, setRecords)
}

func (a *App) ExportGroupCSV(groupID int64) error {
	groupName, err := a.GetGroupName(groupID)
	if err != nil {
		groupName = "group"
	}

	groupAssets, err := a.GetGroupAssets(groupID)
	if err != nil {
		return err
	}

	return a.exportCollectionCSV(groupName, groupAssets)
}

func (a *App) ExportSetPDF(setID int64) error {
	setName, err := a.GetSetName(setID)
	if err != nil {
		setName = "set"
	}

	setRecords, err := a.GetSetRecords(setID)
	if err != nil {
		return err
	}

	return a.exportCollectionPDF(setName, setRecords)
}

func (a *App) ExportGroupPDF(groupID int64) error {
	groupName, err := a.GetGroupName(groupID)
	if err != nil {
		groupName = "group"
	}

	groupAssets, err := a.GetGroupAssets(groupID)
	if err != nil {
		return err
	}

	return a.exportCollectionPDF(groupName, groupAssets)
}

func (a *App) exportCollectionCSV(collectionName string, collectionRecords []CollectionRecord) error {
	currDate := time.Now().Format("0601020304")
	fileName, err := chooseSaveFile(&a.ctx, CSV, fmt.Sprintf("%s-%s.csv", collectionName, currDate))
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

	err = writer.Write([]string{"ID", "Name", "Location", "Serial Number", "Record Locator", "Association"})
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		hasErrors = true
	}

	totalAssets := len(collectionRecords)

	runtime.EventsEmit(a.ctx, "export-progress", 0.0)
	defer runtime.EventsEmit(a.ctx, "export-progress", 1.0)

	for i, asset := range collectionRecords {
		err = writer.Write([]string{
			strconv.FormatInt(asset.Id, 10),
			asset.Name.String,
			asset.Location.String,
			asset.Serial.String,
			fmt.Sprintf("%05d", asset.RecordLocator),
			asset.AssociatedBy,
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

func (a *App) exportCollectionPDF(collectionName string, collectionRecords []CollectionRecord) error {
	currDate := time.Now().Format("0601020304")
	fileName, err := chooseSaveFile(&a.ctx, PDF, fmt.Sprintf("%s-%s.pdf", collectionName, currDate))
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

	// Add first page
	pdf.AddPage()

	// Standard line height calculations
	baseLineHeight := 6.0
	sectionSpacing := 8.0

	runtime.EventsEmit(a.ctx, "export-progress", 0.0)
	defer runtime.EventsEmit(a.ctx, "export-progress", 1.0)

	totalAssets := len(collectionRecords)

	// Group title
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetTextColor(0, 51, 102) // Dark blue for titles
	pdf.CellFormat(0, 12, collectionName, "", 1, "C", false, 0, "")
	pdf.Ln(sectionSpacing)

	// Reset text color to black
	pdf.SetTextColor(0, 0, 0)

	// Table header styling
	pdf.SetFillColor(220, 220, 220) // Light gray background
	pdf.SetDrawColor(128, 128, 128) // Gray border
	pdf.SetFont("Helvetica", "B", 10)

	// Column widths (should total to ~180mm to fit within margins)
	nameWidth := 70.0
	locationWidth := 60.0
	serialWidth := 50.0

	// Table header
	pdf.CellFormat(nameWidth, baseLineHeight*1.5, "Name", "1", 0, "C", true, 0, "")
	pdf.CellFormat(locationWidth, baseLineHeight*1.5, "Location", "1", 0, "C", true, 0, "")
	pdf.CellFormat(serialWidth, baseLineHeight*1.5, "Serial Number", "1", 1, "C", true, 0, "")

	// Reset fill color for data rows
	pdf.SetFillColor(255, 255, 255) // White background
	pdf.SetFont("Helvetica", "", 9)

	// Track current page height to handle page breaks
	pageHeight := 279.4 // Letter height in mm
	bottomMargin := 15.0
	maxY := pageHeight - bottomMargin

	for i, asset := range collectionRecords {
		// Check if we need a new page (accounting for row height)
		if pdf.GetY() > maxY-baseLineHeight*2 {
			pdf.AddPage()

			// Redraw table header on new page
			pdf.SetFillColor(220, 220, 220)
			pdf.SetFont("Helvetica", "B", 10)
			pdf.CellFormat(nameWidth, baseLineHeight*1.5, "Name", "1", 0, "C", true, 0, "")
			pdf.CellFormat(locationWidth, baseLineHeight*1.5, "Location", "1", 0, "C", true, 0, "")
			pdf.CellFormat(serialWidth, baseLineHeight*1.5, "Serial Number", "1", 1, "C", true, 0, "")

			pdf.SetFillColor(255, 255, 255)
			pdf.SetFont("Helvetica", "", 9)
		}

		// Alternate row colors for better readability
		fill := i%2 == 1
		if fill {
			pdf.SetFillColor(245, 245, 245) // Very light gray
		} else {
			pdf.SetFillColor(255, 255, 255) // White
		}

		// Handle empty values
		name := asset.Name.String
		if name == "" {
			name = "N/A"
		}

		location := asset.Location.String
		if location == "" {
			location = "N/A"
		}

		serial := asset.Serial.String
		if serial == "" {
			serial = "N/A"
		}

		// Data rows with borders
		pdf.CellFormat(nameWidth, baseLineHeight*1.2, name, "1", 0, "L", fill, 0, "")
		pdf.CellFormat(locationWidth, baseLineHeight*1.2, location, "1", 0, "L", fill, 0, "")
		pdf.CellFormat(serialWidth, baseLineHeight*1.2, serial, "1", 1, "L", fill, 0, "")

		// Update progress
		runtime.EventsEmit(a.ctx, "export-progress", float64(i+1)/float64(totalAssets))
	}

	err = pdf.OutputFileAndClose(fileName)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return err
	}

	return nil
}
