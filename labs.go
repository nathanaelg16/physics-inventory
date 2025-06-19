package main

import (
	"database/sql"
	"encoding/csv"
	"errors"
	"fmt"
	"github.com/go-sql-driver/mysql"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"strconv"
	"strings"
	"time"
)

type LabDataType uint8

const (
	AssetType LabDataType = 0
	GroupType LabDataType = 1
	SetType   LabDataType = 2
)

func (l LabDataType) String() string {
	switch l {
	case AssetType:
		return "Asset"
	case GroupType:
		return "Group"
	case SetType:
		return "Set"
	default:
		return "Unknown"
	}
}

type LabCourse struct {
	CourseNumber string `json:"courseNumber"`
	CourseName   string `json:"courseName"`
}

type Lab struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

type LabData struct {
	Id                   int64          `json:"id"`
	Type                 LabDataType    `json:"type"`
	TypeId               int64          `json:"typeId"`
	Name                 sql.NullString `json:"name"`
	Location             sql.NullString `json:"location"`
	QuantityPerStation   string         `json:"quantityPerStation"`
	QuantityOnFrontTable string         `json:"quantityOnFrontTable"`
	Consumable           bool           `json:"consumable"`
	Notes                sql.NullString `json:"notes"`
}

type LabDetails struct {
	CourseNumber string `json:"courseNumber"`
	CourseName   string `json:"courseName"`
	LabName      string `json:"labName"`
	LabId        int64  `json:"labId"`
}

func (a *App) CreateLabCourse(courseNumber string, courseName string) error {
	if ok := a.verifyMaintainerAccess(); !ok {
		return fmt.Errorf("insufficient privileges")
	}

	courseNumber = strings.TrimSpace(courseNumber)
	courseName = strings.TrimSpace(courseName)

	if len(courseNumber) == 0 {
		return fmt.Errorf("course number is empty")
	}

	if len(courseName) == 0 {
		return fmt.Errorf("course name is empty")
	}

	_, err := a.db.Exec("insert into lab_courses (course_name, course_number) values (?, ?);", courseName, courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred creating new lab course: %v", err)

		var mysqlError *mysql.MySQLError
		if errors.As(err, &mysqlError) {
			if mysqlError.Number == 1062 {
				return fmt.Errorf("course number already exists")
			}
		}

		return fmt.Errorf("a database error occurred: %s", err.Error())
	}

	return nil
}

func (a *App) RenameLabCourse(courseNumber string, courseName string) error {
	if ok := a.verifyMaintainerAccess(); !ok {
		return fmt.Errorf("insufficient privileges")
	}

	if len(courseNumber) == 0 {
		return fmt.Errorf("course number is empty")
	}

	courseName = strings.TrimSpace(courseName)

	if len(courseName) == 0 {
		return fmt.Errorf("course name is empty")
	}

	_, err := a.db.Exec("update lab_courses set course_name = ? where course_number = ?;", courseName, courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred renaming lab course: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	return nil
}

func (a *App) DeleteLabCourse(courseNumber string) error {
	if ok := a.verifyMaintainerAccess(); !ok {
		return fmt.Errorf("insufficient privileges")
	}

	tx, err := a.db.Begin()
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred beginning transaction: %v", err)
		return fmt.Errorf("a database error occurred")
	}
	defer tx.Rollback()

	_, err = tx.Exec("delete from lab_data where lab_id in (select id from labs where lab_course_number = ?);", courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting lab data: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from labs where lab_course_number = ?;", courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting labs: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from lab_courses where course_number = ?;", courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting lab courses: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	err = tx.Commit()
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred committing transaction: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	return nil
}

func (a *App) CreateLab(courseNumber string, labName string) error {
	if ok := a.verifyMaintainerAccess(); !ok {
		return fmt.Errorf("insufficient privileges")
	}

	if len(courseNumber) == 0 {
		return fmt.Errorf("course number is empty")
	}

	labName = strings.TrimSpace(labName)

	if len(labName) == 0 {
		return fmt.Errorf("lab name is empty")
	}

	_, err := a.db.Exec("insert into labs (lab_course_number, lab_name) values (?, ?);", courseNumber, labName)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred creating new lab: %v", err)
		return fmt.Errorf("a database error occurred: %s", err.Error())
	}

	return nil
}

func (a *App) RenameLab(labId int64, labName string) error {
	if ok := a.verifyMaintainerAccess(); !ok {
		return fmt.Errorf("insufficient privileges")
	}

	if len(labName) == 0 {
		return fmt.Errorf("lab name is empty")
	}

	_, err := a.db.Exec("update labs set lab_name = ? where id = ?;", labName, labId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred renaming lab: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	return nil
}

func (a *App) DeleteLab(labId int64) error {
	if ok := a.verifyMaintainerAccess(); !ok {
		return fmt.Errorf("insufficient privileges")
	}

	tx, err := a.db.Begin()
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred beginning transaction: %v", err)
		return fmt.Errorf("a database error occurred")
	}
	defer tx.Rollback()

	_, err = tx.Exec("delete from lab_data where lab_id = ?;", labId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting lab data: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from labs where id = ?;", labId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting lab: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	err = tx.Commit()
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred committing transaction: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	return nil
}

func (a *App) GetLabCourses() ([]LabCourse, error) {
	labCourses := make([]LabCourse, 0, 10)

	rows, err := a.db.Query("select course_name, course_number from lab_courses order by course_number;")
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab courses: %v", err)
		return nil, fmt.Errorf("error getting lab courses: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var row LabCourse

		err = rows.Scan(&row.CourseName, &row.CourseNumber)
		if err != nil {
			runtime.LogErrorf(a.ctx, "error scanning lab course: %v", err)
			continue
		}

		labCourses = append(labCourses, row)
	}

	return labCourses, nil
}

func (a *App) GetLabs(courseNumber string) ([]Lab, error) {
	labs := make([]Lab, 0, 10)

	rows, err := a.db.Query("select id, lab_name from labs where lab_course_number = ? order by lab_name;", courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting labs for lab course %s: %v", courseNumber, err)
		return nil, fmt.Errorf("error getting labs: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var lab Lab

		err = rows.Scan(&lab.Id, &lab.Name)
		if err != nil {
			runtime.LogErrorf(a.ctx, "error scanning lab: %v", err)
			continue
		}

		labs = append(labs, lab)
	}

	return labs, nil
}

func (a *App) GetLabDetails(labId int64) (LabDetails, error) {
	var labDetails LabDetails

	err := a.db.QueryRow("select l.lab_course_number, l.lab_name, lc.course_name from labs l inner join lab_courses lc on l.lab_course_number = lc.course_number where l.id = ?;", labId).Scan(&labDetails.CourseNumber, &labDetails.LabName, &labDetails.CourseName)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab for lab id %d: %v", labId, err)
		return labDetails, fmt.Errorf("error getting lab: %v", err)
	}

	labDetails.LabId = labId

	return labDetails, nil
}

func (a *App) GetLabData(labId int64) ([]LabData, error) {
	labData := make([]LabData, 0, 10)

	rows, err := a.db.Query("select id, type, type_id, quantity_per_station, quantity_on_front_table, consumable, notes from lab_data where lab_id = ?;", labId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab data for lab id %d: %v", labId, err)
		return nil, fmt.Errorf("error getting lab data: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var labDatum LabData
		var consumable uint8

		err = rows.Scan(&labDatum.Id, &labDatum.Type, &labDatum.TypeId, &labDatum.QuantityPerStation, &labDatum.QuantityOnFrontTable, &consumable, &labDatum.Notes)
		if err != nil {
			runtime.LogErrorf(a.ctx, "error scanning lab data: %v", err)
			continue
		}

		if labDatum.Type == AssetType {
			err = a.db.QueryRow("select item_name, location from equipment where id = ?;", labDatum.TypeId).Scan(&labDatum.Name, &labDatum.Location)
			if err != nil {
				runtime.LogErrorf(a.ctx, "error scanning lab asset data from equipment table: %v", err)
				continue
			}
		} else if labDatum.Type == GroupType {
			err = a.db.QueryRow("select name from `groups` where id = ?;", labDatum.TypeId).Scan(&labDatum.Name)
			if err != nil {
				runtime.LogErrorf(a.ctx, "error scanning lab group data from groups table: %v", err)
				continue
			}
		} else if labDatum.Type == SetType {
			err = a.db.QueryRow("select name from sets where id = ?;", labDatum.TypeId).Scan(&labDatum.Name)
			if err != nil {
				runtime.LogErrorf(a.ctx, "error scanning lab set data from sets table: %v", err)
				continue
			}
		} else {
			runtime.LogErrorf(a.ctx, "unknown lab data type: %v", labDatum.Type)
			continue
		}

		if consumable == 1 {
			labDatum.Consumable = true
		} else {
			labDatum.Consumable = false
		}

		labData = append(labData, labDatum)
	}

	return labData, nil
}

func (a *App) AddLabData(labId int64, labDataType LabDataType, labDataTypeId int64, qtyPerStation string, qtyFrontTable string, consumable bool, notes string) error {
	if ok := a.verifyMaintainerAccess(); !ok {
		return fmt.Errorf("insufficient privileges")
	}

	if qtyPerStation == "" {
		return fmt.Errorf("quantity per station is required")
	}

	if qtyFrontTable == "" {
		return fmt.Errorf("quantity front table is required")
	}

	var sqlNotes sql.NullString
	if len(notes) > 0 {
		sqlNotes = sql.NullString{
			Valid:  true,
			String: notes,
		}
	} else {
		sqlNotes = sql.NullString{
			Valid:  false,
			String: "",
		}
	}

	_, err := a.db.Exec("insert into lab_data (lab_id, type, type_id, quantity_per_station, quantity_on_front_table, consumable, notes) values (?, ?, ?, ?, ?, ?, ?);", labId, labDataType, labDataTypeId, qtyPerStation, qtyFrontTable, consumable, sqlNotes)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error adding lab data: %v", err)
		return fmt.Errorf("a database error occurred: %v", err)
	}

	return nil
}

func (a *App) UpdateLabData(id int64, field string, newValue string) error {
	if ok := a.verifyMaintainerAccess(); !ok {
		return fmt.Errorf("insufficient privileges")
	}

	var err error

	switch field {
	case "notes":
		var notes sql.NullString
		if len(newValue) > 0 {
			notes = sql.NullString{String: newValue, Valid: true}
		} else {
			notes = sql.NullString{String: "", Valid: false}
		}
		_, err = a.db.Exec("update lab_data set notes = ? where id = ?;", notes, id)
	case "consumable":
		var consumable bool
		if newValue == "true" {
			consumable = true
		} else if newValue == "false" {
			consumable = false
		} else {
			err = fmt.Errorf("unknown consumable value: %v", newValue)
			break
		}
		_, err = a.db.Exec("update lab_data set consumable = ? where id = ?;", consumable, id)
	case "quantityPerStation":
		if len(newValue) == 0 {
			err = fmt.Errorf("quantityPerStation is required")
			break
		}
		_, err = a.db.Exec("update lab_data set quantity_per_station = ? where id = ?;", newValue, id)
	case "quantityOnFrontTable":
		if len(newValue) == 0 {
			err = fmt.Errorf("quantityOnFrontTable is required")
			break
		}
		_, err = a.db.Exec("update lab_data set quantity_on_front_table = ? where id = ?;", newValue, id)
	default:
		err = fmt.Errorf("unknown field: %v", field)
	}

	if err != nil {
		runtime.LogErrorf(a.ctx, "error updating lab data: %v", err)
		return fmt.Errorf("error updating lab data: %v", err)
	}

	return nil
}

func (a *App) RemoveLabData(id int64) error {
	if ok := a.verifyMaintainerAccess(); !ok {
		return fmt.Errorf("insufficient privileges")
	}

	_, err := a.db.Exec("delete from lab_data where id = ?;", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error removing lab data: %v", err)
		return fmt.Errorf("error removing lab data: %v", err)
	}

	return nil
}

func (a *App) ExportLabCSV(id int64) error {
	labDetails, err := a.GetLabDetails(id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab details for export: %v", err)
		return err
	}

	currDate := time.Now().Format("0601020304")
	fileName, err := chooseSaveFile(&a.ctx, CSV, fmt.Sprintf("%s-%s-%s", labDetails.CourseNumber, labDetails.LabName, currDate))
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

	err = writer.Write([]string{"Type", "Name", "Location", "Qty per Station", "Qty Front Table", "Consumable", "Notes"})
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		hasErrors = true
	}

	labData, err := a.GetLabData(id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab data: %v", err)
		return err
	}

	totalData := len(labData)

	runtime.EventsEmit(a.ctx, "export-progress", 0.0)
	defer runtime.EventsEmit(a.ctx, "export-progress", 1.0)

	for i, labDatum := range labData {
		err := writer.Write([]string{
			labDatum.Type.String(),
			labDatum.Name.String,
			labDatum.Location.String,
			labDatum.QuantityPerStation,
			labDatum.QuantityOnFrontTable,
			strconv.FormatBool(labDatum.Consumable),
			labDatum.Notes.String,
		})

		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			hasErrors = true
		}

		runtime.EventsEmit(a.ctx, "export-progress", float64(i+1)/float64(totalData))
	}

	writer.Flush()

	if hasErrors {
		return fmt.Errorf("operation completed with errors")
	}

	return nil
}

func (a *App) ExportLabPDF(id int64) error {
	labDetails, err := a.GetLabDetails(id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab details for export: %v", err)
		return err
	}

	currDate := time.Now().Format("0601020304")
	fileName, err := chooseSaveFile(&a.ctx, PDF, fmt.Sprintf("%s-%s-%s.pdf", labDetails.CourseNumber, labDetails.LabName, currDate))
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

	runtime.EventsEmit(a.ctx, "export-progress", 0.0)
	defer runtime.EventsEmit(a.ctx, "export-progress", 1.0)

	labData, err := a.GetLabData(id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab data: %v", err)
		return err
	}

	totalData := len(labData)

	// Lab title with course info
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetTextColor(0, 51, 102) // Dark blue for titles
	pdf.CellFormat(0, 10, fmt.Sprintf("%s - %s", labDetails.CourseNumber, labDetails.CourseName), "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "B", 14)
	pdf.CellFormat(0, 8, labDetails.LabName, "", 1, "C", false, 0, "")
	pdf.Ln(8)

	// Configuration
	baseRowHeight := 6.5
	itemSpacing := 3.0  // Space between items for better separation
	pageHeight := 279.4 // Letter height in mm
	bottomMargin := 20.0
	maxY := pageHeight - bottomMargin
	leftMargin := 15.0

	// Column widths for letter size (185mm usable width) - adjusted for consumable overflow
	nameWidth := 70.0 // Reduced slightly from 75.0
	typeWidth := 18.0
	locationWidth := 35.0
	perStationWidth := 22.0
	frontTableWidth := 22.0
	consumableWidth := 23.0 // Increased from 18.0

	// Helper function to calculate required height for text in a cell
	calculateTextHeight := func(text string, width float64, fontSize float64) float64 {
		if text == "" {
			return baseRowHeight
		}
		pdf.SetFont("Helvetica", "", fontSize)
		lines := pdf.SplitLines([]byte(text), width-4) // -4 for better cell padding
		lineCount := len(lines)
		if lineCount == 0 {
			lineCount = 1
		}
		return float64(lineCount) * baseRowHeight
	}

	// Helper function to draw table header
	drawTableHeader := func() {
		pdf.SetFont("Helvetica", "B", 10)
		pdf.SetTextColor(255, 255, 255) // White text
		pdf.SetFillColor(0, 51, 102)    // Dark blue background

		headerHeight := baseRowHeight * 1.5
		pdf.CellFormat(nameWidth, headerHeight, "Item Name", "1", 0, "C", true, 0, "")
		pdf.CellFormat(typeWidth, headerHeight, "Type", "1", 0, "C", true, 0, "")
		pdf.CellFormat(locationWidth, headerHeight, "Location", "1", 0, "C", true, 0, "")
		pdf.CellFormat(perStationWidth, headerHeight, "Per Station", "1", 0, "C", true, 0, "")
		pdf.CellFormat(frontTableWidth, headerHeight, "Front Table", "1", 0, "C", true, 0, "")
		pdf.CellFormat(consumableWidth, headerHeight, "Consumable", "1", 1, "C", true, 0, "")

		// Reset text color
		pdf.SetTextColor(0, 0, 0)
	}

	// Helper function to draw multi-line cell content
	drawMultiLineCell := func(x, y, width, height float64, text string, fontSize float64, align string, border bool, fill bool) {
		if fill {
			pdf.SetFillColor(248, 248, 248)
			pdf.Rect(x, y, width, height, "F")
		}

		if text != "" {
			pdf.SetFont("Helvetica", "", fontSize)
			pdf.SetXY(x+2, y) // Better padding for readability
			pdf.MultiCell(width-4, baseRowHeight, text, "", align, false)
		}

		if border {
			pdf.SetDrawColor(0, 0, 0) // Black borders for better visibility
			pdf.Rect(x, y, width, height, "D")
		}
	}

	// Draw initial table header
	drawTableHeader()
	rowIndex := 0

	// Process each lab data item
	for i, labDatum := range labData {
		// Handle empty values
		name := labDatum.Name.String

		location := labDatum.Location.String

		notes := labDatum.Notes.String

		// Calculate required height for this row based on longest text
		nameHeight := calculateTextHeight(name, nameWidth, 9)
		locationHeight := calculateTextHeight(location, locationWidth, 9)
		notesHeight := float64(0)
		if notes != "" {
			notesHeight = calculateTextHeight(notes, nameWidth+typeWidth+locationWidth, 9) // Notes span multiple columns
		}

		// Row height is the maximum of all text heights, minimum baseRowHeight
		rowHeight := nameHeight
		if locationHeight > rowHeight {
			rowHeight = locationHeight
		}
		if rowHeight < baseRowHeight {
			rowHeight = baseRowHeight
		}

		// Additional height for notes if present
		totalItemHeight := rowHeight
		if notes != "" {
			totalItemHeight += notesHeight
		}
		// Add spacing between items
		totalItemHeight += itemSpacing

		// Check if we need a new page
		if pdf.GetY()+totalItemHeight+baseRowHeight > maxY { // +baseRowHeight for header
			pdf.AddPage()
			pdf.Ln(5)
			drawTableHeader()
			rowIndex = 0
		}

		currentY := pdf.GetY()

		// Consumable indicator
		consumableText := ""
		if labDatum.Consumable {
			consumableText = "Yes"
		} else {
			consumableText = "No"
		}

		// Draw main row cells with proper heights
		drawMultiLineCell(leftMargin, currentY, nameWidth, rowHeight, name, 9, "L", true, false)
		drawMultiLineCell(leftMargin+nameWidth, currentY, typeWidth, rowHeight, labDatum.Type.String(), 9, "C", true, false)
		drawMultiLineCell(leftMargin+nameWidth+typeWidth, currentY, locationWidth, rowHeight, location, 9, "L", true, false)
		drawMultiLineCell(leftMargin+nameWidth+typeWidth+locationWidth, currentY, perStationWidth, rowHeight, labDatum.QuantityPerStation, 9, "C", true, false)
		drawMultiLineCell(leftMargin+nameWidth+typeWidth+locationWidth+perStationWidth, currentY, frontTableWidth, rowHeight, labDatum.QuantityOnFrontTable, 9, "C", true, false)
		drawMultiLineCell(leftMargin+nameWidth+typeWidth+locationWidth+perStationWidth+frontTableWidth, currentY, consumableWidth, rowHeight, consumableText, 9, "C", true, false)

		// Move to next line
		pdf.SetY(currentY + rowHeight)

		// Add notes row if present
		if notes != "" {
			notesY := pdf.GetY()

			// Notes label
			pdf.SetFont("Helvetica", "B", 9)
			pdf.SetXY(leftMargin+3, notesY+2)
			pdf.CellFormat(25, baseRowHeight, "Notes:", "", 0, "L", false, 0, "")

			// Notes content spanning remaining width
			notesStartX := leftMargin + 28
			notesWidth := nameWidth + typeWidth + locationWidth + perStationWidth + frontTableWidth + consumableWidth - 28
			drawMultiLineCell(notesStartX, notesY, notesWidth, notesHeight, notes, 9, "L", true, false)

			// Draw border around entire notes section
			pdf.SetDrawColor(0, 0, 0) // Black borders to match cells
			pdf.Rect(leftMargin, notesY, nameWidth+typeWidth+locationWidth+perStationWidth+frontTableWidth+consumableWidth, notesHeight, "D")

			pdf.SetY(notesY + notesHeight)
		}

		// Add spacing between items
		pdf.SetY(pdf.GetY() + itemSpacing)

		rowIndex++

		// Update progress
		runtime.EventsEmit(a.ctx, "export-progress", float64(i+1)/float64(totalData))
	}

	// Add footer information
	pdf.Ln(10)
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(100, 100, 100)
	pdf.CellFormat(0, 5, fmt.Sprintf("Generated on %s", time.Now().Format("January 2, 2006 at 3:04 PM")), "", 1, "L", false, 0, "")
	pdf.CellFormat(0, 5, fmt.Sprintf("Total items: %d", totalData), "", 1, "L", false, 0, "")

	err = pdf.OutputFileAndClose(fileName)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return err
	}

	return nil
}
