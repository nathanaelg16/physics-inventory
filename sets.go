package main

import (
	"errors"
	"fmt"
	"github.com/go-sql-driver/mysql"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Set struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

func (a *App) CreateSet(name string) (int64, error) {
	res, err := a.db.Exec("insert into sets (name) values (?);", name)
	if err != nil {
		var mysqlError *mysql.MySQLError
		if errors.As(err, &mysqlError) {
			if mysqlError.Number == 1062 {
				return -1, fmt.Errorf("a set with the name '%s' already exists", name)
			}
		}

		runtime.LogErrorf(a.ctx, "%v", err)
		return -1, err
	}

	insertId, err := res.LastInsertId()
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return -1, nil
	}

	return insertId, nil
}

func (a *App) RenameSet(id int64, name string) error {
	_, err := a.db.Exec("update sets set name = ? where id = ?;", name, id)
	if err != nil {
		var mysqlError *mysql.MySQLError
		if errors.As(err, &mysqlError) {
			if mysqlError.Number == 1062 {
				return fmt.Errorf("a set with the name '%s' already exists", name)
			}
		}

		runtime.LogErrorf(a.ctx, "%v", err)
		return err
	}

	return nil
}

func (a *App) DeleteSet(id int64) error {
	tx, err := a.db.Begin()
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return fmt.Errorf("a database error occurred")
	}
	defer tx.Rollback()

	_, err = tx.Exec("delete from lab_data where type = ? and type_id = ?;", SetType, id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from set_records where set_id = ?;", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from sets where id = ?;", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return fmt.Errorf("a database error occurred")
	}

	err = tx.Commit()
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return fmt.Errorf("a database error occurred")
	}

	return nil
}

func (a *App) GetSets() ([]Set, error) {
	rows, err := a.db.Query("select id, name from sets order by name;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sets = make([]Set, 0, 10)

	for rows.Next() {
		var set Set

		err := rows.Scan(&set.Id, &set.Name)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			continue
		}

		sets = append(sets, set)
	}

	return sets, nil
}

func (a *App) GetSetRecords(id int64) ([]CollectionRecord, error) {
	var setRecords = make([]CollectionRecord, 0, 10)

	idRows, err := a.db.Query("select id, item_name, location, serial_number, record_locator from equipment where id in (select asset_id from set_records where set_id = ? and asset_id is not null);", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting set records by id: %v", err)
		return nil, fmt.Errorf("a database error occurred: %v", err)
	}
	defer idRows.Close()

	for idRows.Next() {
		var setRecord CollectionRecord

		err := idRows.Scan(&setRecord.Id, &setRecord.Name, &setRecord.Location, &setRecord.Serial, &setRecord.RecordLocator)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			continue
		}
		setRecord.AssociatedBy = "id"
		setRecords = append(setRecords, setRecord)
	}

	rnRows, err := a.db.Query("select id, item_name, location, serial_number, record_locator from equipment where record_locator in (select asset_record_number from set_records where set_id = ? and asset_record_number is not null);", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting set records by record number: %v", err)
		return nil, fmt.Errorf("a database error occurred: %v", err)
	}
	defer rnRows.Close()

	for rnRows.Next() {
		var setRecord CollectionRecord

		err := rnRows.Scan(&setRecord.Id, &setRecord.Name, &setRecord.Location, &setRecord.Serial, &setRecord.RecordLocator)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			continue
		}
		setRecord.AssociatedBy = "recordLocator"
		setRecords = append(setRecords, setRecord)
	}

	groupRows, err := a.db.Query("select id, name from `groups` where id in (select collection_group_id from set_records where set_id = ? and collection_group_id is not null);", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting set records by group: %v", err)
		return nil, fmt.Errorf("a database error occurred: %v", err)
	}
	defer groupRows.Close()

	for groupRows.Next() {
		var setRecord CollectionRecord

		err := groupRows.Scan(&setRecord.Id, &setRecord.Name)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			continue
		}
		setRecord.AssociatedBy = "group"
		setRecords = append(setRecords, setRecord)
	}

	return setRecords, nil
}

func (a *App) GetSetName(id int64) (string, error) {
	var name string

	err := a.db.QueryRow("select name from sets where id = ?;", id).Scan(&name)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting set name by id: %v", err)
		return "", fmt.Errorf("a database error occurred: %v", err)
	}

	return name, nil
}

func (a *App) AddSetRecordAssociatedByGroup(setId int64, groupId int64) error {
	_, err := a.db.Exec("insert into set_records (set_id, collection_group_id) values (?, ?);", setId, groupId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error adding set record associated by group: %v", err)
		return fmt.Errorf("a database error occurred: %v", err)
	}

	return nil
}

func (a *App) DeleteSetRecordAssociatedById(setId int64, assetId int64) error {
	_, err := a.db.Exec("delete from set_records where set_id = ? and asset_id = ?;", setId, assetId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error deleting set record associated by id: %v", err)
		return fmt.Errorf("a database error occurred: %v", err)
	}

	return nil
}

func (a *App) DeleteSetRecordAssociatedByRecordLocator(setId int64, recordLocator int64) error {
	_, err := a.db.Exec("delete from set_records where set_id = ? and asset_record_number = ?;", setId, recordLocator)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error deleting set record associated by record locator: %v", err)
		return fmt.Errorf("a database error occurred: %v", err)
	}

	return nil
}

func (a *App) DeleteSetRecordAssociatedByGroup(setId int64, groupId int64) error {
	_, err := a.db.Exec("delete from set_records where set_id = ? and collection_group_id = ?;", setId, groupId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error deleting set record associated by group: %v", err)
		return fmt.Errorf("a database error occurred: %v", err)
	}

	return nil
}
