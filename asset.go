package main

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
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
}

func (a *App) GetAsset(id int64) (Asset, error) {
	db := a.db
	var asset Asset
	var missing sql.NullString
	var softCopyAvailable, hardCopyAvailable, receiptAvailable uint8
	row := db.QueryRow("select e.id, i.image_one, e.item_name, e.location, e.keywords, e.brand, e.model, e.part, e.serial_number, e.au_inventory, e.quantity, e.purchase_date, e.purchase_amount, e.missing, e.quantity_missing, e.record_locator, e.date_reported_missing, e.reported_missing_by, e.notes, e.soft_copy_available, e.hard_copy_available, e.receipt_available, e.unit_price, e.vendor from equipment e left join images_and_receipts i on e.id = i.id where e.id = ?", id)
	err := row.Scan(&asset.Id, &asset.Image, &asset.Name, &asset.Location, &asset.Keywords, &asset.Brand, &asset.Model, &asset.Part, &asset.Serial, &asset.AUInventory, &asset.Quantity, &asset.PurchaseDate, &asset.PurchaseAmount, &missing, &asset.QuantityMissing, &asset.RecordLocator, &asset.DateReportedMissing, &asset.ReportedMissingBy, &asset.Notes, &softCopyAvailable, &hardCopyAvailable, &receiptAvailable, &asset.UnitPrice, &asset.Vendor)
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

	if softCopyAvailable == 1 {
		asset.SoftCopyAvailable = true
	} else {
		asset.SoftCopyAvailable = false
	}

	if hardCopyAvailable == 1 {
		asset.HardCopyAvailable = true
	} else {
		asset.HardCopyAvailable = false
	}

	if receiptAvailable == 1 {
		asset.ReceiptAvailable = true
	} else {
		asset.ReceiptAvailable = false
	}

	return asset, nil
}

func (a *App) UpdateAsset(updates map[string]any) error {
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
