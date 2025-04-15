package main

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
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
	var softCopyAvailable, hardCopyAvailable, receiptAvailable uint8

	row := db.QueryRow("select e.id, i.image_one, e.item_name, e.location, e.keywords, e.brand, e.model, e.part, e.serial_number, e.au_inventory, e.quantity, e.purchase_date, e.purchase_amount, e.missing, e.quantity_missing, e.record_locator, e.date_reported_missing, e.reported_missing_by, e.notes, e.soft_copy_available, e.hard_copy_available, e.receipt_available, e.unit_price, e.vendor, m.repair_status, m.status_change_date, m.status_history, m.last_calibration_date, m.next_calibration_date, m.calibration_history, m.notes as maintenanceNotes from equipment e left join images_and_receipts i on e.id = i.id left join maintenance m on e.id = m.id where e.id = ?", id)
	err := row.Scan(&asset.Id, &asset.Image, &asset.Name, &asset.Location, &asset.Keywords, &asset.Brand, &asset.Model, &asset.Part, &asset.Serial, &asset.AUInventory, &asset.Quantity, &asset.PurchaseDate, &asset.PurchaseAmount, &missing, &asset.QuantityMissing, &asset.RecordLocator, &asset.DateReportedMissing, &asset.ReportedMissingBy, &asset.Notes, &softCopyAvailable, &hardCopyAvailable, &receiptAvailable, &asset.UnitPrice, &asset.Vendor, &repairStatus, &asset.StatusChangeDate, &statusHistory, &asset.LastCalibrationDate, &asset.NextCalibrationDate, &calibrationHistory, &asset.MaintenanceNotes)
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

	asset.SoftCopyAvailable = softCopyAvailable == 1
	asset.HardCopyAvailable = hardCopyAvailable == 1
	asset.ReceiptAvailable = receiptAvailable == 1

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
	var db = a.db

	var equipmentTableFieldNames = map[string]string{
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

	var maintenanceTableFieldNames = map[string]string{
		"nextCalibrationDate": "next_calibration_date",
		"maintenanceNotes":    "notes",
	}

	var mappedEquipmentTableUpdates = make(map[string]any)
	var mappedMaintenanceTableUpdates = make(map[string]any)

	for key, value := range updates {
		equipmentTableFieldName, ok := equipmentTableFieldNames[key]
		if ok {
			validatedValue, err := validateValue(key, value)
			if err != nil {
				runtime.LogErrorf(a.ctx, "UpdateAsset failed for field '%s': %v", equipmentTableFieldName, err)
				return err
			}
			mappedEquipmentTableUpdates[equipmentTableFieldName] = validatedValue
		} else {
			maintenanceTableFieldName, ok1 := maintenanceTableFieldNames[key]
			if ok1 {
				validatedValue, err := validateValue(key, value)
				if err != nil {
					runtime.LogErrorf(a.ctx, "UpdateAsset failed for field '%s': %v", maintenanceTableFieldName, err)
					return err
				}
				mappedMaintenanceTableUpdates[maintenanceTableFieldName] = validatedValue
			}
		}
	}

	if len(mappedEquipmentTableUpdates) > 0 {
		query := "update equipment set "

		placeholders := make([]string, 0, len(mappedEquipmentTableUpdates))
		values := make([]any, 0, len(mappedEquipmentTableUpdates)+1)

		for field, value := range mappedEquipmentTableUpdates {
			placeholders = append(placeholders, field+" = ?")
			values = append(values, value)
		}

		query += strings.Join(placeholders, ", ")
		query += " where id = ?;"

		values = append(values, id)

		stmt, err := db.Prepare(query)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: failed to prepare statement: %v", err)
			return fmt.Errorf("A database error occurred: %v", err)
		}
		defer stmt.Close()

		_, err = stmt.Exec(values...)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: failed to update: %v", err)
			return fmt.Errorf("A database error occurred: %v", err)
		}
	}

	if len(mappedMaintenanceTableUpdates) > 0 {
		query := "insert into maintenance (id"
		valuesPlaceholders := "?"
		values := []any{id}

		var updateParts []string
		for field := range mappedMaintenanceTableUpdates {
			query += ", " + field
			valuesPlaceholders += ", ?"
			values = append(values, mappedMaintenanceTableUpdates[field])
			updateParts = append(updateParts, field+" = new_values."+field)
		}

		query += ") values (" + valuesPlaceholders + ") as new_values"
		query += " on duplicate key update " + strings.Join(updateParts, ", ")

		runtime.LogDebugf(a.ctx, "UpdateAsset query: %s", query)

		// Prepare and execute the statement
		stmt, err := db.Prepare(query)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: failed to prepare maintenance statement: %v", err)
			return fmt.Errorf("A database error occurred: %v", err)
		}
		defer stmt.Close()

		_, err = stmt.Exec(values...)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: failed to update maintenance: %v", err)
			return fmt.Errorf("A database error occurred: %v", err)
		}
	}

	// update maintenance status
	if value, contains := updates["repairStatus"]; contains {
		newStatus, err := validateValue("repairStatus", value)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset failed for field 'repairStatus': %v", err)
			return err
		}

		var currentStatus sql.NullString
		err = db.QueryRow("select repair_status from maintenance where id = ?;", id).Scan(&currentStatus)
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: repair status query failed: %v", err)
			return fmt.Errorf("A database error occurred: %v", err)
		}

		var currentDate = time.Now().Format("2006-01-02")
		var statusHistory = fmt.Sprintf("%s: %s", parseRepairStatus(currentStatus.String).Expanded(), currentDate)

		query := `insert into maintenance (id, repair_status, status_change_date, status_history) 
          values (?, ?, ?, ?) 
          on duplicate key update 
          repair_status = ?, 
          status_change_date = ?, 
          status_history = concat_ws(?, status_history, ?)`

		_, err = db.Exec(query,
			id, newStatus, currentDate, statusHistory, // INSERT values
			newStatus, currentDate, ";", statusHistory) // UPDATE values
		if err != nil {
			runtime.LogErrorf(a.ctx, "UpdateAsset: maintenance upsert failed: %v", err)
			return fmt.Errorf("A database error occurred: %v", err)
		}

		// Handle the special CALIBRATING case
		if newStatus == "C" {
			calibQuery := `update maintenance 
                   set last_calibration_date = ?, 
                   calibration_history = concat_ws(?, calibration_history, ?) 
                   where id = ?`

			_, err = db.Exec(calibQuery, currentDate, ";", currentDate, id)
			if err != nil {
				runtime.LogErrorf(a.ctx, "UpdateAsset: calibration update failed: %v", err)
				return fmt.Errorf("A database error occurred while updating calibration: %v", err)
			}
		}
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
