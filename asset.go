package main

import (
	"database/sql"
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
