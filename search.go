package main

import (
	"database/sql"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"regexp"
	"strconv"
	"strings"
)

type SearchMode int

const (
	Regular                    SearchMode = 0
	Boolean                    SearchMode = 1
	FullText                   SearchMode = 2
	FullTextWithQueryExpansion SearchMode = 3
)

func (searchMode SearchMode) String() string {
	switch searchMode {
	case Regular:
		return "regular"
	case Boolean:
		return "boolean"
	case FullText:
		return "full_text"
	case FullTextWithQueryExpansion:
		return "full_text_query_expansion"
	default:
		return "unknown"
	}
}

func (a *App) SetDefaultSearchMode(mode string) error {
	var newDefaultSearchMode SearchMode

	switch mode {
	case "regular":
		newDefaultSearchMode = Regular
	case "full_text":
		newDefaultSearchMode = FullText
	case "full_text_query_expansion":
		newDefaultSearchMode = FullTextWithQueryExpansion
	case "boolean":
		newDefaultSearchMode = Boolean
	default:
		newDefaultSearchMode = Regular
	}

	db := a.db

	stmt, err := db.Prepare("update users set preferred_search_mode = ? where username = ?;")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(newDefaultSearchMode, a.username)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return err
	}

	return nil
}

func (a *App) GetDefaultSearchMode() string {
	db := a.db
	stmt, err := db.Prepare("select preferred_search_mode from users where username = ?;")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return "regular"
	}

	var searchMode SearchMode
	err = stmt.QueryRow(a.username).Scan(&searchMode)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return "regular"
	}

	return searchMode.String()
}

func (a *App) SearchModeRegular(query string, withType string) ([]Asset, error) {
	query = strings.TrimSpace(query)

	switch withType {
	case "location":
		query = wildcardWrap(query)

	case "notes", "item_name":
		query = formatQueryForField(query)

	case "keywords":
		if len(query) == 0 {
			return a.runSimpleQuery(0)
		} else {
			var name, keywords string

			// Handle name pattern
			if strings.Contains(query, "*") {
				name = wildcardWrap(strings.ReplaceAll(query, "*", "%"))
			} else {
				name = wildcardWrap(strings.ReplaceAll(query, " ", "%"))
			}

			// Handle keyword pattern
			query = strings.ReplaceAll(query, "*", " ")
			query = strings.TrimSpace(query)
			keywords = wildcardWrap(strings.ReplaceAll(query, " ", "%"))

			return a.runKeywordQuery(name, keywords, 0)
		}
	case "record_locator":
		toInt, err := strconv.Atoi(query)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			return nil, fmt.Errorf("query must consist of numeric values")
		}
		query = strconv.Itoa(toInt)
	default:
		if len(query) == 0 {
			query = "%"
		}
	}

	return a.runFieldQuery(withType, query, 0)
}

func (a *App) SearchModeFullText(query string) ([]Asset, error) {
	stmt, err := a.db.Prepare("select e.id, i.image_one, e.location, e.item_name, e.brand, e.model, e.part, e.serial_number, e.au_inventory, e.quantity, e.missing from equipment e left join images_and_receipts i on e.id = i.id where match (e.item_name, e.keywords, e.brand, e.model, e.vendor) against (? in natural language mode);")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(query)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}

	return a.processResults(rows), nil
}

func (a *App) SearchModeFullTextWithQueryExpansion(query string) ([]Asset, error) {
	stmt, err := a.db.Prepare("select e.id, i.image_one, e.location, e.item_name, e.brand, e.model, e.part, e.serial_number, e.au_inventory, e.quantity, e.missing from equipment e left join images_and_receipts i on e.id = i.id where match (e.item_name, e.keywords, e.brand, e.model, e.vendor) against (? in natural language mode with query expansion);")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(query)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}

	return a.processResults(rows), nil
}

func (a *App) SearchModeBoolean(query string) ([]Asset, error) {
	stmt, err := a.db.Prepare("select e.id, i.image_one, e.location, e.item_name, e.brand, e.model, e.part, e.serial_number, e.au_inventory, e.quantity, e.missing from equipment e left join images_and_receipts i on e.id = i.id where match (e.item_name, e.keywords, e.brand, e.model, e.vendor) against (? in boolean mode);")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(query)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}

	return a.processResults(rows), nil
}

func wildcardWrap(s string) string {
	if len(s) == 0 {
		return "%"
	}

	return "%" + s + "%"
}

func formatQueryForField(query string) string {
	if len(query) == 0 {
		return "%"
	}

	if strings.Contains(query, "*") {
		return regexp.MustCompile(`\*+`).ReplaceAllString(query, "%")
	}

	return wildcardWrap(strings.Join(strings.Fields(query), "%"))
}

func (a *App) runSimpleQuery(page int) ([]Asset, error) {
	stmt, err := a.db.Prepare("select e.id, i.image_one, e.location, e.item_name, e.brand, e.model, e.part, e.serial_number, e.au_inventory, e.quantity, e.missing from equipment e left join images_and_receipts i on e.id = i.id order by item_name limit 25 offset ?;")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(page)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}

	return a.processResults(rows), nil
}

func (a *App) runKeywordQuery(name, keywords string, page int) ([]Asset, error) {
	stmt, err := a.db.Prepare("select e.id, i.image_one, e.location, e.item_name, e.brand, e.model, e.part, e.serial_number, e.au_inventory, e.quantity, e.missing from equipment e left join images_and_receipts i on e.id = i.id where item_name like ? or keywords like ? limit 25 offset ?;")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(name, keywords, page)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}

	return a.processResults(rows), nil
}

func (a *App) runFieldQuery(field string, query string, page int) ([]Asset, error) {
	stmt, err := a.db.Prepare(fmt.Sprintf("select e.id, i.image_one, e.location, e.item_name, e.brand, e.model, e.part, e.serial_number, e.au_inventory, e.quantity, e.missing from equipment e left join images_and_receipts i on e.id = i.id where %s like ? order by item_name limit 25 offset ?;", field))
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(query, page)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil, err
	}

	return a.processResults(rows), nil
}

func (a *App) processResults(rows *sql.Rows) []Asset {
	defer rows.Close()

	var assets = make([]Asset, 0, 15)

	for rows.Next() {
		var asset Asset
		var missing sql.NullString

		err := rows.Scan(&asset.Id, &asset.Image, &asset.Location, &asset.Name, &asset.Brand, &asset.Model, &asset.Part, &asset.Serial, &asset.AUInventory, &asset.Quantity, &missing)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
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

		assets = append(assets, asset)
	}

	return assets
}
