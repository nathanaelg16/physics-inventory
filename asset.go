package main

import (
	"database/sql"
)

type Asset struct {
	Id                  int64          `json:"id"`
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
