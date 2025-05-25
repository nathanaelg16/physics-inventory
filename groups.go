package main

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/go-sql-driver/mysql"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type GroupAsset struct {
	Id            int64          `json:"id"`
	Name          sql.NullString `json:"name"`
	Location      sql.NullString `json:"location"`
	Serial        sql.NullString `json:"serial"`
	RecordLocator int64          `json:"recordLocator"`
	AssociatedBy  string         `json:"associatedBy"`
}

type Group struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

func (a *App) CreateGroup(name string) (int64, error) {
	res, err := a.db.Exec("insert into `groups` (name) values (?);", name)
	if err != nil {
		var mysqlError *mysql.MySQLError
		if errors.As(err, &mysqlError) {
			if mysqlError.Number == 1062 {
				return -1, fmt.Errorf("a group with the name '%s' already exists", name)
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

func (a *App) RenameGroup(id int64, name string) error {
	_, err := a.db.Exec("update `groups` set name = ? where id = ?;", name, id)
	if err != nil {
		var mysqlError *mysql.MySQLError
		if errors.As(err, &mysqlError) {
			if mysqlError.Number == 1062 {
				return fmt.Errorf("a group with the name '%s' already exists", name)
			}
		}

		runtime.LogErrorf(a.ctx, "%v", err)
		return err
	}

	return nil
}

func (a *App) DeleteGroup(id int64) error {
	tx, err := a.db.Begin()
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return fmt.Errorf("a database error occurred")
	}
	defer tx.Rollback()

	_, err = tx.Exec("delete from lab_data where type = ? and type_id = ?;", GroupType, id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from group_records where group_id = ?;", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "%v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from `groups` where id = ?;", id)
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

func (a *App) GetGroups() ([]Group, error) {
	rows, err := a.db.Query("select id, name from `groups` order by name;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups = make([]Group, 0, 10)

	for rows.Next() {
		var group Group

		err := rows.Scan(&group.Id, &group.Name)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			continue
		}

		groups = append(groups, group)
	}

	return groups, nil
}

func (a *App) GetGroupAssets(id int64) ([]GroupAsset, error) {
	var groupAssets = make([]GroupAsset, 0, 10)

	idRows, err := a.db.Query("select id, item_name, location, serial_number, record_locator from equipment where id in (select asset_id from group_records where group_id = ? and asset_id is not null);", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting group assets by id: %v", err)
		return nil, fmt.Errorf("a database error occurred: %v", err)
	}
	defer idRows.Close()

	for idRows.Next() {
		var groupAsset GroupAsset

		err := idRows.Scan(&groupAsset.Id, &groupAsset.Name, &groupAsset.Location, &groupAsset.Serial, &groupAsset.RecordLocator)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			continue
		}
		groupAsset.AssociatedBy = "id"
		groupAssets = append(groupAssets, groupAsset)
	}

	rnRows, err := a.db.Query("select id, item_name, location, serial_number, record_locator from equipment where record_locator in (select asset_record_number from group_records where group_id = ? and asset_record_number is not null);", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting group assets by record number: %v", err)
		return nil, fmt.Errorf("a database error occurred: %v", err)
	}
	defer rnRows.Close()

	for rnRows.Next() {
		var groupAsset GroupAsset

		err := rnRows.Scan(&groupAsset.Id, &groupAsset.Name, &groupAsset.Location, &groupAsset.Serial, &groupAsset.RecordLocator)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			continue
		}
		groupAsset.AssociatedBy = "recordLocator"
		groupAssets = append(groupAssets, groupAsset)
	}

	return groupAssets, nil
}

func (a *App) GetGroupName(id int64) (string, error) {
	var name string

	err := a.db.QueryRow("select name from `groups` where id = ?;", id).Scan(&name)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting group name by id: %v", err)
		return "", fmt.Errorf("a database error occurred: %v", err)
	}

	return name, nil
}

func (a *App) DeleteGroupAssetAssociatedById(groupId int64, assetId int64) error {
	_, err := a.db.Exec("delete from group_records where group_id = ? and asset_id = ?;", groupId, assetId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error deleting group asset associated by id: %v", err)
		return fmt.Errorf("a database error occurred: %v", err)
	}

	return nil
}

func (a *App) DeleteGroupAssetAssociatedByRecordLocator(groupId int64, recordLocator int64) error {
	_, err := a.db.Exec("delete from group_records where group_id = ? and asset_record_number = ?;", groupId, recordLocator)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error deleting group asset associated by record locator: %v", err)
		return fmt.Errorf("a database error occurred: %v", err)
	}

	return nil
}
