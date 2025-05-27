package main

import (
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type LabDataType uint8

const (
	AssetType LabDataType = 0
	GroupType LabDataType = 1
	SetType   LabDataType = 2
)

type LabCourse struct {
	Id           int64  `json:"id"`
	CourseNumber string `json:"courseNumber"`
	CourseName   string `json:"courseName"`
}

type Lab struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

type LabData struct {
	RecordId             int64       `json:"recordId"`
	Type                 LabDataType `json:"type"`
	TypeId               int64       `json:"typeId"`
	QuantityPerStation   string      `json:"quantityPerStation"`
	QuantityOnFrontTable string      `json:"quantityOnFrontTable"`
	Consumable           bool        `json:"consumable"`
	Notes                string      `json:"notes"`
}

func (a *App) GetLabCourses() ([]LabCourse, error) {
	labCourses := make([]LabCourse, 0, 10)

	rows, err := a.db.Query("select id, course_name, course_number from lab_courses;")
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab courses: %v", err)
		return nil, fmt.Errorf("error getting lab courses: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var row LabCourse

		err = rows.Scan(&row.Id, &row.CourseName, &row.CourseNumber)
		if err != nil {
			runtime.LogErrorf(a.ctx, "error scanning lab course: %v", err)
			continue
		}

		labCourses = append(labCourses, row)
	}

	return labCourses, nil
}

func (a *App) GetLabs(labCourseId int64) ([]Lab, error) {
	labs := make([]Lab, 0, 10)

	rows, err := a.db.Query("select id, lab_name from labs;")
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting labs for lab course id %d: %v", labCourseId, err)
		return nil, fmt.Errorf("error getting labs: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var lab Lab

		err = rows.Scan(&lab.Id, &lab.Name)
		if err != nil {
			runtime.LogErrorf(a.ctx, "error scanning lab: %v", err)
			continue
		}

		labs = append(labs, lab)
	}

	return labs, nil
}

func (a *App) GetLabData(labId int64) ([]LabData, error) {
	labData := make([]LabData, 0, 10)

	rows, err := a.db.Query("select id, type, type_id, quantity_per_station, quantity_on_front_table, consumable, notes from lab_data;")
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab data for lab id %d: %v", labId, err)
		return nil, fmt.Errorf("error getting lab data: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var labDatum LabData
		var consumable uint8

		err = rows.Scan(&labDatum.RecordId, &labDatum.Type, &labDatum.TypeId, &labDatum.QuantityPerStation, &labDatum.QuantityOnFrontTable, &consumable, &labDatum.Notes)
		if err != nil {
			runtime.LogErrorf(a.ctx, "error scanning lab data: %v", err)
			continue
		}

		if consumable == 1 {
			labDatum.Consumable = true
		} else {
			labDatum.Consumable = false
		}

		labData = append(labData, labDatum)
	}

	return labData, nil
}
