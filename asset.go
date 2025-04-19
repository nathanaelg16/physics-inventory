package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"
)

type Asset struct {
	Id                  int64          `json:"id"`
	Image               []byte         `json:"image"`
	Name                sql.NullString `json:"name"`
	Location            sql.NullString `json:"location"`
	Keywords            sql.NullString `json:"keywords"`
	Brand               sql.NullString `json:"brand"`
	Model               sql.NullString `json:"model"`
	Part                sql.NullString `json:"part"`
	Serial              sql.NullString `json:"serial"`
	AUInventory         sql.NullString `json:"auInventory"`
	Quantity            sql.NullString `json:"quantity"`
	PurchaseDate        sql.NullTime   `json:"purchaseDate"`
	PurchaseAmount      sql.NullString `json:"purchaseAmount"`
	Missing             bool           `json:"missing"`
	QuantityMissing     sql.NullString `json:"quantityMissing"`
	RecordLocator       int64          `json:"recordLocator"`
	DateReportedMissing sql.NullTime   `json:"dateReportedMissing"`
	ReportedMissingBy   sql.NullString `json:"reportedMissingBy"`
	Notes               sql.NullString `json:"notes"`
	SoftCopyAvailable   bool           `json:"softCopyAvailable"`
	HardCopyAvailable   bool           `json:"hardCopyAvailable"`
	ReceiptAvailable    bool           `json:"receiptAvailable"`
	UnitPrice           string         `json:"unitPrice"`
	Vendor              string         `json:"vendor"`

	// Maintenance Details
	RepairStatus        RepairStatus       `json:"repairStatus"`
	StatusChangeDate    sql.NullTime       `json:"statusChangeDate"`
	StatusHistory       []HistoricalStatus `json:"statusHistory"`
	LastCalibrationDate sql.NullTime       `json:"lastCalibrationDate"`
	NextCalibrationDate sql.NullTime       `json:"nextCalibrationDate"`
	CalibrationHistory  []string           `json:"calibrationHistory"`
	MaintenanceNotes    sql.NullString     `json:"maintenanceNotes"`
}

func (a *App) GetAsset(id int64) (Asset, error) {
	db := a.db

	var asset Asset
	var missing, repairStatus, statusHistory, calibrationHistory sql.NullString
	var hardCopyAvailable sql.NullBool

	row := db.QueryRow("select e.id, i.image_one, e.item_name, e.location, e.keywords, e.brand, e.model, e.part, e.serial_number, e.au_inventory, e.quantity, e.purchase_date, e.purchase_amount, e.missing, e.quantity_missing, e.record_locator, e.date_reported_missing, e.reported_missing_by, e.notes, not isnull(mn.soft_copy_manual) as soft_copy_available, mn.hard_copy_available, not isnull(i.receipt) as receipt_available, e.unit_price, e.vendor, m.repair_status, m.status_change_date, m.status_history, m.last_calibration_date, m.next_calibration_date, m.calibration_history, m.notes as maintenanceNotes from equipment e left join images_and_receipts i on e.id = i.id left join maintenance m on e.id = m.id left join manuals mn on e.record_locator = mn.record_locator where e.id = ?", id)
	err := row.Scan(&asset.Id, &asset.Image, &asset.Name, &asset.Location, &asset.Keywords, &asset.Brand, &asset.Model, &asset.Part, &asset.Serial, &asset.AUInventory, &asset.Quantity, &asset.PurchaseDate, &asset.PurchaseAmount, &missing, &asset.QuantityMissing, &asset.RecordLocator, &asset.DateReportedMissing, &asset.ReportedMissingBy, &asset.Notes, &asset.SoftCopyAvailable, &hardCopyAvailable, &asset.ReceiptAvailable, &asset.UnitPrice, &asset.Vendor, &repairStatus, &asset.StatusChangeDate, &statusHistory, &asset.LastCalibrationDate, &asset.NextCalibrationDate, &calibrationHistory, &asset.MaintenanceNotes)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return asset, err
	}

	if missing.Valid {
		if missing.String == "" || missing.String == "0" || missing.String == "-1" {
			asset.Missing = false
		} else {
			asset.Missing = true
		}
	} else {
		asset.Missing = false
	}

	asset.HardCopyAvailable = hardCopyAvailable.Bool

	if repairStatus.Valid {
		asset.RepairStatus = parseRepairStatus(repairStatus.String)
	} else {
		asset.RepairStatus = UNKNOWN
	}

	if statusHistory.Valid {
		asset.StatusHistory = parseStatusHistory(statusHistory.String)
	}

	if calibrationHistory.Valid {
		asset.CalibrationHistory = strings.Split(calibrationHistory.String, ";")
	}

	return asset, nil
}

func (a *App) UpdateAsset(id int64, updates map[string]string) error {
	// Define field mappings
	equipmentTableFieldNames := map[string]string{
		"name":              "item_name",
		"location":          "location",
		"keywords":          "keywords",
		"brand":             "brand",
		"model":             "model",
		"part":              "part",
		"serial":            "serial_number",
		"auInventory":       "au_inventory",
		"quantity":          "quantity",
		"purchaseDate":      "purchase_date",
		"purchaseAmount":    "purchase_amount",
		"recordLocator":     "record_locator",
		"notes":             "notes",
		"hardCopyAvailable": "hard_copy_available",
		"unitPrice":         "unit_price",
		"vendor":            "vendor",
	}

	maintenanceTableFieldNames := map[string]string{
		"nextCalibrationDate": "next_calibration_date",
		"maintenanceNotes":    "notes",
	}

	// Validate all inputs
	validatedEquipmentUpdates := make(map[string]any)
	validatedMaintenanceUpdates := make(map[string]any)
	var newRepairStatus any
	var hasRepairStatus bool

	for key, value := range updates {
		validatedValue, err := validateValue(key, value)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset validation failed for field '%s': %v", key, err)
			return fmt.Errorf("validation failed for field '%s': %w", key, err)
		}

		if key == "repairStatus" {
			newRepairStatus = validatedValue
			hasRepairStatus = true
			continue // Handle repair status separately
		}

		if dbField, ok := equipmentTableFieldNames[key]; ok {
			validatedEquipmentUpdates[dbField] = validatedValue
		} else if dbField, ok := maintenanceTableFieldNames[key]; ok {
			validatedMaintenanceUpdates[dbField] = validatedValue
		}
	}

	// Begin transaction
	tx, err := a.db.Begin()
	if err != nil {
		runtime.LogErrorf(a.ctx, "UpdateAsset: failed to begin transaction: %v", err)
		return fmt.Errorf("database error -- failed to begin transaction: %w", err)
	}
	defer tx.Rollback() // Will be ignored if transaction is committed

	// Update equipment table if needed
	if len(validatedEquipmentUpdates) > 0 {
		query := "update equipment set "

		placeholders := make([]string, 0, len(validatedEquipmentUpdates))
		values := make([]any, 0, len(validatedEquipmentUpdates)+1)

		for field, value := range validatedEquipmentUpdates {
			placeholders = append(placeholders, field+" = ?")
			values = append(values, value)
		}

		query += strings.Join(placeholders, ", ")
		query += " where id = ?;"
		values = append(values, id)

		stmt, err := tx.Prepare(query)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: failed to prepare statement: %v", err)
			return fmt.Errorf("database error -- failed to prepare statement: %w", err)
		}

		_, err = stmt.Exec(values...)
		stmt.Close() // Close the statement regardless of error

		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: failed to update equipment: %v", err)
			return fmt.Errorf("failed to update asset: %w", err)
		}
	}

	// Update maintenance table if needed
	if len(validatedMaintenanceUpdates) > 0 {
		query := "insert into maintenance (id"
		valuesPlaceholders := "?"
		values := []any{id}

		var updateParts []string
		for field, value := range validatedMaintenanceUpdates {
			query += ", " + field
			valuesPlaceholders += ", ?"
			values = append(values, value)
			updateParts = append(updateParts, field+" = new_values."+field)
		}

		query += ") values (" + valuesPlaceholders + ") as new_values"
		query += " on duplicate key update " + strings.Join(updateParts, ", ")

		stmt, err := tx.Prepare(query)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: failed to prepare maintenance statement: %v", err)
			return fmt.Errorf("database error -- failed to prepare statement: %w", err)
		}

		_, err = stmt.Exec(values...)
		stmt.Close()

		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: failed to update maintenance: %v", err)
			return fmt.Errorf("failed to update asset maintenance details: %w", err)
		}
	}

	// Handle the repair status updates
	if hasRepairStatus {
		var currentStatus sql.NullString
		var currentHistory sql.NullString
		err = tx.QueryRow("select repair_status, status_history from maintenance where id = ?", id).Scan(&currentStatus, &currentHistory)

		// If there's no maintenance record yet, treat as if status is unknown
		if errors.Is(err, sql.ErrNoRows) {
			currentStatus = sql.NullString{String: string(UNKNOWN), Valid: true}
			currentHistory = sql.NullString{Valid: false}
			err = nil
		}

		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: repair status query failed: %v", err)
			return fmt.Errorf("database error -- failed to query current repair status: %w", err)
		}

		var currentDate = time.Now().Format("2006-01-02")
		var newHistoryEntry = fmt.Sprintf("%s: %s", parseRepairStatus(currentStatus.String).Expanded(), currentDate)

		var combinedHistory string
		if !currentHistory.Valid || currentHistory.String == "" {
			combinedHistory = newHistoryEntry
		} else {
			combinedHistory = currentHistory.String + ";" + newHistoryEntry
		}

		// Insert/update the repair status with history
		query := `insert into maintenance (id, repair_status, status_change_date, status_history) 
				  values (?, ?, ?, ?) as new_row
				  on duplicate key update 
				  repair_status = new_row.repair_status, 
				  status_change_date = new_row.status_change_date, 
				  status_history = ?`

		stmt, err := tx.Prepare(query)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: failed to prepare status statement: %v", err)
			return fmt.Errorf("database error -- failed to prepare statement: %w", err)
		}

		_, err = stmt.Exec(
			id, newRepairStatus, currentDate, newHistoryEntry, // INSERT values
			combinedHistory) // UPDATE value for history
		stmt.Close()

		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: status update failed: %v", err)
			return fmt.Errorf("failed to update repair status: %w", err)
		}

		// Handle the CALIBRATING case
		if newRepairStatus == "C" {
			// Get current calibration history
			var calibHistory sql.NullString
			err = tx.QueryRow("select calibration_history from maintenance where id = ?", id).Scan(&calibHistory)

			// Handle the case where the row might not exist yet (should be rare since we just inserted/updated it)
			if errors.Is(err, sql.ErrNoRows) {
				calibHistory = sql.NullString{Valid: false}
				err = nil
			}

			if err != nil {
				runtime.LogErrorf(a.ctx, "UpdateAsset: calibration history query failed: %v", err)
				return fmt.Errorf("database error -- failed to query calibration history: %w", err)
			}

			// Build the new calibration history string
			var combinedCalibHistory string
			if !calibHistory.Valid || calibHistory.String == "" {
				combinedCalibHistory = currentDate
			} else {
				combinedCalibHistory = calibHistory.String + ";" + currentDate
			}

			calibQuery := `update maintenance 
							   set last_calibration_date = ?, 
							   calibration_history = ?
							   where id = ?`

			stmt, err := tx.Prepare(calibQuery)
			if err != nil {
				runtime.LogErrorf(a.ctx, "UpdateAsset: failed to prepare calibration statement: %v", err)
				return fmt.Errorf("database error -- failed to prepare statement: %w", err)
			}

			_, err = stmt.Exec(currentDate, combinedCalibHistory, id)
			stmt.Close()

			if err != nil {
				runtime.LogErrorf(a.ctx, "UpdateAsset: calibration update failed: %v", err)
				return fmt.Errorf("failed to update calibration information: %w", err)
			}
		}
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		runtime.LogErrorf(a.ctx, "UpdateAsset: failed to commit transaction: %v", err)
		return fmt.Errorf("database error -- failed to commit transaction: %w", err)
	}

	return nil
}

// AssignRecordLocator gets the next available record locator number and assigns it to the specified asset if needed
func (a *App) AssignRecordLocator(assetID int64) error {
	db := a.db

	// Start a transaction to ensure consistency
	tx, err := db.Begin()
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error starting transaction: %v", err)
		return err
	}
	defer tx.Rollback() // Will be ignored if transaction is committed

	// Check if the specified asset exists and whether it has a record locator
	var currentLocator int
	err = tx.QueryRow("select record_locator from equipment where id = ?;", assetID).Scan(&currentLocator)

	if errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("asset with ID %d not found", assetID)
	} else if err != nil {
		runtime.LogErrorf(a.ctx, "Error checking asset record locator: %v", err)
		return err
	}

	// If the asset already has a valid record locator (not -1), return it
	if currentLocator != -1 {
		// Commit the transaction since we're just reading
		if err = tx.Commit(); err != nil {
			runtime.LogErrorf(a.ctx, "Error committing transaction: %v", err)
			return err
		}
		return nil
	}

	// If we get here, the asset needs a record locator assigned (it has the default -1 value)
	// Get the last assigned record locator
	var recordNumber int
	err = tx.QueryRow("select record_locator from last_assigned_record_locator;").Scan(&recordNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error retrieving last record locator: %v", err)
		return err
	}

	// Increment the record number
	recordNumber++

	// Find the next available record locator
	for {
		var exists bool
		err = tx.QueryRow("select exists(select 1 from equipment where record_locator = ?);", recordNumber).Scan(&exists)
		if err != nil {
			runtime.LogErrorf(a.ctx, "Error checking record locator existence: %v", err)
			return err
		}

		// If number is available, break out of loop
		if !exists {
			break
		}

		// Try next number
		recordNumber++
	}

	// Update the equipment record with the new record locator
	_, err = tx.Exec("update equipment set record_locator = ? where id = ?;", recordNumber, assetID)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error updating equipment record locator: %v", err)
		return err
	}

	// Update the last assigned record locator in the database
	_, err = tx.Exec("update last_assigned_record_locator set record_locator = ?;", recordNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error updating last record locator: %v", err)
		return err
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		runtime.LogErrorf(a.ctx, "Error committing transaction: %v", err)
		return err
	}

	return nil
}

func (a *App) ToggleMissing(id int64, isMissing bool, quantityMissing string) error {
	var missing string
	var reportedBy sql.NullString
	var reportDate sql.NullTime
	var missingQuantity sql.NullString

	if isMissing {
		missing = "1"
		reportedBy = sql.NullString{Valid: true, String: a.username}
		reportDate = sql.NullTime{Valid: true, Time: time.Now()}
		missingQuantity = sql.NullString{Valid: true, String: quantityMissing}
	} else {
		missing = "0"
		reportedBy = sql.NullString{Valid: false}
		reportDate = sql.NullTime{Valid: false}
		missingQuantity = sql.NullString{Valid: false}
	}

	stmt, err := a.db.Prepare("update equipment set missing = ?, reported_missing_by = ?, date_reported_missing = ?, quantity_missing = ? where id = ?;")
	defer stmt.Close()
	if err != nil {
		runtime.LogErrorf(a.ctx, "ToggleMissing: Error preparing statement: %v", err)
		return fmt.Errorf("database error -- failed to prepare statement: %w", err)
	}

	_, err = stmt.Exec(missing, reportedBy, reportDate, missingQuantity, id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "ToggleMissing: Error executing statement: %v", err)
		return fmt.Errorf("database error -- failed to update missing status: %w", err)
	}

	return nil
}

func (a *App) ChangeImage(id int64) (bool, error) {
	options := runtime.OpenDialogOptions{
		Filters: []runtime.FileFilter{{
			DisplayName: "Images (*.png, *.jpg, *.tiff)",
			Pattern:     "*.png;*.jpg;*.jpeg;*.tiff",
		}},
	}

	imagePath, err := runtime.OpenFileDialog(a.ctx, options)
	if err != nil || len(imagePath) == 0 {
		runtime.LogErrorf(a.ctx, "Error with open file dialog: %v", err)
		return false, nil
	}

	imageBytes, err := os.ReadFile(imagePath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error reading file: %v", err)
		return false, fmt.Errorf("error reading file: %w", err)
	}

	query := `insert into images_and_receipts (id, image_one) 
				values (?, ?) as new_row
				on duplicate key update image_one = new_row.image_one;`

	_, err = a.db.Exec(query, id, imageBytes)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error changing image for asset id #%d: %v", id, err)
		return false, fmt.Errorf("updating image failed: %w", err)
	}

	return true, nil
}

func (a *App) RemoveImage(id int64) error {
	query := `update images_and_receipts set image_one = null where id = ?;`

	_, err := a.db.Exec(query, id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error removing image for asset id #%d: %v", id, err)
		return fmt.Errorf("failed to delete image: %w", err)
	}

	return nil
}

func (a *App) UploadManual(recordLocator int64) (bool, error) {
	if recordLocator <= 0 {
		return false, fmt.Errorf("asset must have a valid record number")
	}

	filePath, err := chooseUploadFile(&a.ctx)
	if err != nil || len(filePath) == 0 {
		runtime.LogErrorf(a.ctx, "Error selecting manual: %v", err)
		return false, nil
	}

	fileBytes, err := readDocument(filePath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return false, err
	}

	_, err = a.db.Exec("insert into manuals (record_locator, soft_copy_manual) values (?, ?) as new_row on duplicate key update soft_copy_manual = new_row.soft_copy_manual;", recordLocator, fileBytes)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error inserting manual: %v", err)
		return false, fmt.Errorf("error uploading manual: %w", err)
	}

	return true, nil
}

func (a *App) UploadReceipt(id int64) (bool, error) {
	filePath, err := chooseUploadFile(&a.ctx)
	if err != nil || len(filePath) == 0 {
		runtime.LogErrorf(a.ctx, "Error selecting receipt: %v", err)
		return false, nil
	}

	fileBytes, err := readDocument(filePath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return false, err
	}

	_, err = a.db.Exec(`insert into images_and_receipts (id, receipt) values (?, ?) as new_row
								on duplicate key update receipt = new_row.receipt;`, id, fileBytes)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error inserting receipt: %v", err)
		return false, fmt.Errorf("error uploading receipt: %w", err)
	}

	return true, nil
}

func (a *App) DownloadManual(id, recordLocator int64) (bool, error) {
	assetName, err := retrieveAssetName(a, id)
	if err != nil {
		return false, err
	}

	defaultFileName := assetName + " - Manual.pdf"
	filePath, err := chooseSaveFile(&a.ctx, defaultFileName)
	if err != nil || len(filePath) == 0 {
		runtime.LogErrorf(a.ctx, "Error save file dialog: %v", err)
		return false, nil
	}

	fileBytes := make([]byte, 512)
	err = a.db.QueryRow("select soft_copy_manual from manuals where record_locator = ?;", recordLocator).Scan(&fileBytes)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			runtime.LogErrorf(a.ctx, "No manual file found with record_locator %d", recordLocator)
			return false, fmt.Errorf("no manual found")
		} else {
			runtime.LogErrorf(a.ctx, "Error retrieving manual: %v", err)
			return false, fmt.Errorf("database error -- failed to retrieve manual: %w", err)
		}
	}

	err = saveDocument(filePath, fileBytes)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error saving document: %v", err)
		return false, fmt.Errorf("failed to save document: %w", err)
	}

	return true, nil
}

func (a *App) DownloadReceipt(id int64) (bool, error) {
	assetName, err := retrieveAssetName(a, id)
	if err != nil {
		return false, err
	}

	defaultFileName := assetName + " - Receipt.pdf"
	filePath, err := chooseSaveFile(&a.ctx, defaultFileName)
	if err != nil || len(filePath) == 0 {
		runtime.LogErrorf(a.ctx, "Error save file dialog: %v", err)
		return false, nil
	}

	fileBytes := make([]byte, 512)
	err = a.db.QueryRow("select receipt from images_and_receipts where id = ?;", id).Scan(&fileBytes)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			runtime.LogErrorf(a.ctx, "No receipt file found for assset id %d", id)
			return false, fmt.Errorf("no receipt found")
		} else {
			runtime.LogErrorf(a.ctx, "Error retrieving receipt: %v", err)
			return false, fmt.Errorf("database error -- failed to retrieve receipt: %w", err)
		}
	}

	err = saveDocument(filePath, fileBytes)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error saving document: %v", err)
		return false, fmt.Errorf("failed to save document: %w", err)
	}

	return true, nil
}

func (a *App) RemoveManual(recordLocator int64) error {
	query := "update manuals set soft_copy_manual = null where record_locator = ?;"

	_, err := a.db.Exec(query, recordLocator)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error removing manual for record locator #%d: %v", recordLocator, err)
		return fmt.Errorf("failed to delete manual: %w", err)
	}

	return nil
}

func (a *App) RemoveReceipt(id int64) error {
	query := "update images_and_receipts set receipt = null where id = ?;"

	_, err := a.db.Exec(query, id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error removing receipt for asset id #%d: %v", id, err)
		return fmt.Errorf("failed to delete receipt: %w", err)
	}

	return nil
}

func retrieveAssetName(a *App, id int64) (string, error) {
	runtime.LogInfof(a.ctx, "Retrieving asset name for asset id #%d", id)

	var assetName sql.NullString

	err := a.db.QueryRow("select item_name from equipment where id = ?;", id).Scan(&assetName)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			runtime.LogErrorf(a.ctx, "no asset found with id %d", id)
			return "", fmt.Errorf("no asset found with id %d", id)
		} else {
			runtime.LogErrorf(a.ctx, "Error retrieving equipment info: %v", err)
			return "", fmt.Errorf("database error -- failed to retrieve asset info: %w", err)
		}
	}

	return assetName.String, nil
}

func chooseSaveFile(ctx *context.Context, defaultFileName string) (string, error) {
	saveDialogOptions := runtime.SaveDialogOptions{
		DefaultFilename: defaultFileName,
		Filters: []runtime.FileFilter{{
			DisplayName: "PDF (*.pdf)",
			Pattern:     "*.pdf",
		}},
	}

	return runtime.SaveFileDialog(*ctx, saveDialogOptions)
}

func saveDocument(filePath string, data []byte) error {
	if len(filePath) == 0 {
		return fmt.Errorf("no file path specified")
	}

	if len(data) == 0 {
		return fmt.Errorf("no data")
	}

	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	return err
}

const MaxFileSize int64 = 33_554_432 // 32 MiB

func chooseUploadFile(ctx *context.Context) (string, error) {
	dialogOptions := runtime.OpenDialogOptions{
		Filters: []runtime.FileFilter{{
			DisplayName: "PDF files (*.pdf)",
			Pattern:     "*.pdf",
		}},
	}

	return runtime.OpenFileDialog(*ctx, dialogOptions)
}

func readDocument(filePath string) ([]byte, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("error opening file: %w", err)
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		return nil, fmt.Errorf("error getting file info: %w", err)
	}

	if fileInfo.Size() > MaxFileSize {
		return nil, fmt.Errorf("error: selected file too large -- exceeds 32MB")
	}

	fileBytes := make([]byte, fileInfo.Size())
	_, err = file.Read(fileBytes)
	if err != nil {
		return nil, fmt.Errorf("error reading file: %w", err)
	}

	return fileBytes, nil
}

type RepairStatus string

const (
	WORKING     RepairStatus = "W"
	CALIBRATING RepairStatus = "C"
	REPAIRING   RepairStatus = "R"
	TESTING     RepairStatus = "T"
	UNKNOWN     RepairStatus = "U"
)

func parseRepairStatus(s string) RepairStatus {
	switch s {
	case "W":
		return WORKING
	case "C":
		return CALIBRATING
	case "R":
		return REPAIRING
	case "T":
		return TESTING
	case "U":
		return UNKNOWN
	default:
		return UNKNOWN
	}
}

func (r RepairStatus) Expanded() string {
	switch r {
	case WORKING:
		return "Working"
	case CALIBRATING:
		return "Out for calibration"
	case REPAIRING:
		return "Out for repair"
	case TESTING:
		return "Out for testing"
	default:
		return "Unknown"
	}
}

type HistoricalStatus struct {
	RepairStatus     string `json:"repairStatus"`
	StatusChangeDate string `json:"statusChangeDate"`
}

func parseStatusHistory(history string) (statusHistory []HistoricalStatus) {
	var historySplit = strings.Split(history, ";")

	for _, h := range historySplit {
		var parts = strings.Split(h, ": ")
		var repairStatus = parts[0]
		var statusChangeDate = parts[1]
		var historicalStatus = HistoricalStatus{
			RepairStatus:     repairStatus,
			StatusChangeDate: statusChangeDate,
		}
		statusHistory = append(statusHistory, historicalStatus)
	}

	slices.Reverse(statusHistory) // order by date desc

	return statusHistory
}

func validateValue(key string, value string) (any, error) {
	value = strings.TrimSpace(value)

	switch key {
	case "name", "location":
		if len(value) == 0 {
			return nil, fmt.Errorf("field '%s' is empty", key)
		}
		return value, nil
	case "keywords", "brand", "model", "part", "serial", "auInventory", "quantity", "notes", "vendor":
		if len(value) == 0 {
			return sql.NullString{Valid: false}, nil
		} else {
			return value, nil
		}
	case "purchaseDate":
		if len(value) == 0 {
			return sql.NullTime{Valid: false}, nil
		} else {
			valueDate, err := time.Parse("2006-01-02", value)
			if err != nil {
				return nil, fmt.Errorf("field '%s' must be a valid date in the form YYYY-MM-DD", key)
			} else {
				return sql.NullTime{Time: valueDate, Valid: true}, nil
			}
		}
	case "purchaseAmount":
		if len(value) == 0 {
			return sql.NullString{Valid: false}, nil
		} else {
			validatedValue, valid := validateCurrency(value)
			if !valid {
				return nil, fmt.Errorf("field '%s' must be a valid currency amount", key)
			} else {
				return validatedValue, nil
			}
		}
	case "unitPrice":
		if len(value) == 0 {
			return value, nil
		} else {
			validatedValue, valid := validateCurrency(value)
			if !valid {
				return nil, fmt.Errorf("field '%s' must be a valid currency amount", key)
			} else {
				return validatedValue, nil
			}
		}
	case "recordLocator":
		valueInt, err := strconv.Atoi(value)
		if err == nil {
			return valueInt, nil
		} else {
			return nil, fmt.Errorf("field '%s' must be an integer", key)
		}
	case "hardCopyAvailable":
		if value == "true" {
			return true, nil
		} else if value == "false" {
			return false, nil
		} else {
			return nil, fmt.Errorf("field '%s' must be a boolean", key)
		}
	case "repairStatus":
		repairStatus := parseRepairStatus(value)
		if repairStatus == UNKNOWN && value != "U" {
			return nil, fmt.Errorf("field '%s' must be a valid status value", key)
		} else {
			// we return value instead of repairStatus because we want the string to be stored in the db
			// by checking if the repairStatus parsed successfully we ensure we are only putting
			// proper repair status values in the db
			return value, nil
		}
	default:
		return value, nil
	}
}

// ValidateCurrency processes currency amounts:
// 1. Validates the format
// 2. Strips leading zeros from whole number part (except $0.XX)
// 3. Adds dollar sign if not present
// 4. Adds .00 to whole dollar amounts
func validateCurrency(amount string) (string, bool) {
	// Check for invalid cases
	if amount == "$" || amount == "." || amount == "$." || amount == "" {
		return amount, false
	}

	// Store if the amount already has a dollar sign
	hasDollarSign := strings.HasPrefix(amount, "$")

	// Remove dollar sign temporarily for processing
	processAmount := amount
	if hasDollarSign {
		processAmount = amount[1:]
	}

	// Check if amount has decimal places
	hasDecimal := strings.Contains(processAmount, ".")

	// Check for invalid formats: multiple decimal points
	if strings.Count(processAmount, ".") > 1 {
		return amount, false
	}

	// Check for decimal format without leading 0 (like .50)
	if hasDecimal && strings.HasPrefix(processAmount, ".") {
		return amount, false
	}

	if hasDecimal {
		parts := strings.Split(processAmount, ".")
		wholePart := parts[0]
		decimalPart := parts[1]

		// Validate decimal has exactly 2 digits
		if len(decimalPart) != 2 {
			return amount, false
		}

		// Strip leading zeros from whole part, but keep a single 0 if it's all zeros
		wholePart = strings.TrimLeft(wholePart, "0")
		if wholePart == "" {
			wholePart = "0"
		}

		processAmount = wholePart + "." + decimalPart
	} else {
		// Strip leading zeros from whole part when no decimal
		processAmount = strings.TrimLeft(processAmount, "0")
		if processAmount == "" {
			processAmount = "0"
		}

		// Add .00 to whole dollar amounts
		processAmount = processAmount + ".00"
	}

	// Validate the corrected format
	currencyRegex := regexp.MustCompile(`^(\d+)(\.\d{2})$`)
	if !currencyRegex.MatchString(processAmount) {
		return amount, false
	}

	// Add dollar sign
	processAmount = "$" + processAmount

	return processAmount, true
}

// todo when implementing add asset, insert row into maintenance table with working status
