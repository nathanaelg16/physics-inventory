package main

import (
	"database/sql"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type GroupAsset struct {
	Id           int64          `json:"id"`
	Name         sql.NullString `json:"name"`
	Location     sql.NullString `json:"location"`
	Serial       sql.NullString `json:"serial"`
	AssociatedBy string         `json:"associatedBy"`
}

type Group struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
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

	idRows, err := a.db.Query("select id, item_name, location, serial_number from equipment where id in (select asset_id from group_records where group_id = ? and asset_id is not null);", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting group assets by id: %v", err)
		return nil, fmt.Errorf("a database error occurred: %v", err)
	}
	defer idRows.Close()

	for idRows.Next() {
		var groupAsset GroupAsset

		err := idRows.Scan(&groupAsset.Id, &groupAsset.Name, &groupAsset.Location, &groupAsset.Serial)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			continue
		}
		groupAsset.AssociatedBy = "id"
		groupAssets = append(groupAssets, groupAsset)
	}

	rnRows, err := a.db.Query("select id, item_name, location, serial_number from equipment where record_locator in (select asset_record_number from group_records where group_id = ? and asset_record_number is not null);", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting group assets by record number: %v", err)
		return nil, fmt.Errorf("a database error occurred: %v", err)
	}
	defer rnRows.Close()

	for rnRows.Next() {
		var groupAsset GroupAsset

		err := rnRows.Scan(&groupAsset.Id, &groupAsset.Name, &groupAsset.Location, &groupAsset.Serial)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			continue
		}
		groupAsset.AssociatedBy = "recordLocator"
		groupAssets = append(groupAssets, groupAsset)
	}

	return groupAssets, nil
}
