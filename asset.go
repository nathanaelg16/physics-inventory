package main

import (
	"time"
)

type Asset struct {
	id                  int16
	name                string
	location            string
	keywords            string
	brand               string
	model               string
	part                string
	serial              string
	auInventory         string
	quantity            string
	purchaseDate        time.Time
	purchaseAmount      string
	missing             bool
	quantityMissing     string
	recordLocator       int8
	dateReportedMissing time.Time
	reportedMissingBy   string
	notes               string
	softCopyAvailable   bool
	hardCopyAvailable   bool
	receiptAvailable    bool
	unitPrice           string
	vendor              string
}
