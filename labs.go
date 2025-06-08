package main

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/go-sql-driver/mysql"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"strings"
)

type LabDataType uint8

const (
	AssetType LabDataType = 0
	GroupType LabDataType = 1
	SetType   LabDataType = 2
)

type LabCourse struct {
	CourseNumber string `json:"courseNumber"`
	CourseName   string `json:"courseName"`
}

type Lab struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

type LabData struct {
	Id                   int64          `json:"id"`
	Type                 LabDataType    `json:"type"`
	TypeId               int64          `json:"typeId"`
	Name                 sql.NullString `json:"name"`
	Location             sql.NullString `json:"location"`
	QuantityPerStation   string         `json:"quantityPerStation"`
	QuantityOnFrontTable string         `json:"quantityOnFrontTable"`
	Consumable           bool           `json:"consumable"`
	Notes                sql.NullString `json:"notes"`
}

type LabDetails struct {
	CourseNumber string `json:"courseNumber"`
	CourseName   string `json:"courseName"`
	LabName      string `json:"labName"`
	LabId        int64  `json:"labId"`
}

func (a *App) CreateLabCourse(courseNumber string, courseName string) error {
	courseNumber = strings.TrimSpace(courseNumber)
	courseName = strings.TrimSpace(courseName)

	if len(courseNumber) == 0 {
		return fmt.Errorf("course number is empty")
	}

	if len(courseName) == 0 {
		return fmt.Errorf("course name is empty")
	}

	_, err := a.db.Exec("insert into lab_courses (course_name, course_number) values (?, ?);", courseName, courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred creating new lab course: %v", err)

		var mysqlError *mysql.MySQLError
		if errors.As(err, &mysqlError) {
			if mysqlError.Number == 1062 {
				return fmt.Errorf("course number already exists")
			}
		}

		return fmt.Errorf("a database error occurred: %s", err.Error())
	}

	return nil
}

func (a *App) RenameLabCourse(courseNumber string, courseName string) error {
	if len(courseNumber) == 0 {
		return fmt.Errorf("course number is empty")
	}

	courseName = strings.TrimSpace(courseName)

	if len(courseName) == 0 {
		return fmt.Errorf("course name is empty")
	}

	_, err := a.db.Exec("update lab_courses set course_name = ? where course_number = ?;", courseName, courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred renaming lab course: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	return nil
}

func (a *App) DeleteLabCourse(courseNumber string) error {
	tx, err := a.db.Begin()
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred beginning transaction: %v", err)
		return fmt.Errorf("a database error occurred")
	}
	defer tx.Rollback()

	_, err = tx.Exec("delete from lab_data where lab_id in (select id from labs where lab_course_number = ?);", courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting lab data: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from labs where lab_course_number = ?;", courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting labs: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from lab_courses where course_number = ?;", courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting lab courses: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	err = tx.Commit()
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred committing transaction: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	return nil
}

func (a *App) CreateLab(courseNumber string, labName string) error {
	if len(courseNumber) == 0 {
		return fmt.Errorf("course number is empty")
	}

	labName = strings.TrimSpace(labName)

	if len(labName) == 0 {
		return fmt.Errorf("lab name is empty")
	}

	_, err := a.db.Exec("insert into labs (lab_course_number, lab_name) values (?, ?);", courseNumber, labName)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred creating new lab: %v", err)
		return fmt.Errorf("a database error occurred: %s", err.Error())
	}

	return nil
}

func (a *App) RenameLab(labId int64, labName string) error {
	if len(labName) == 0 {
		return fmt.Errorf("lab name is empty")
	}

	_, err := a.db.Exec("update labs set lab_name = ? where id = ?;", labName, labId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred renaming lab: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	return nil
}

func (a *App) DeleteLab(labId int64) error {
	tx, err := a.db.Begin()
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred beginning transaction: %v", err)
		return fmt.Errorf("a database error occurred")
	}
	defer tx.Rollback()

	_, err = tx.Exec("delete from lab_data where lab_id = ?;", labId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting lab data: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	_, err = tx.Exec("delete from labs where id = ?;", labId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred deleting lab: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	err = tx.Commit()
	if err != nil {
		runtime.LogErrorf(a.ctx, "an error occurred committing transaction: %v", err)
		return fmt.Errorf("a database error occurred")
	}

	return nil
}

func (a *App) GetLabCourses() ([]LabCourse, error) {
	labCourses := make([]LabCourse, 0, 10)

	rows, err := a.db.Query("select course_name, course_number from lab_courses order by course_number;")
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab courses: %v", err)
		return nil, fmt.Errorf("error getting lab courses: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var row LabCourse

		err = rows.Scan(&row.CourseName, &row.CourseNumber)
		if err != nil {
			runtime.LogErrorf(a.ctx, "error scanning lab course: %v", err)
			continue
		}

		labCourses = append(labCourses, row)
	}

	return labCourses, nil
}

func (a *App) GetLabs(courseNumber string) ([]Lab, error) {
	labs := make([]Lab, 0, 10)

	rows, err := a.db.Query("select id, lab_name from labs where lab_course_number = ? order by lab_name;", courseNumber)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting labs for lab course %s: %v", courseNumber, err)
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

func (a *App) GetLabDetails(labId int64) (LabDetails, error) {
	var labDetails LabDetails

	err := a.db.QueryRow("select l.lab_course_number, l.lab_name, lc.course_name from labs l inner join lab_courses lc on l.lab_course_number = lc.course_number where l.id = ?;", labId).Scan(&labDetails.CourseNumber, &labDetails.LabName, &labDetails.CourseName)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab for lab id %d: %v", labId, err)
		return labDetails, fmt.Errorf("error getting lab: %v", err)
	}

	labDetails.LabId = labId

	return labDetails, nil
}

func (a *App) GetLabData(labId int64) ([]LabData, error) {
	labData := make([]LabData, 0, 10)

	rows, err := a.db.Query("select id, type, type_id, quantity_per_station, quantity_on_front_table, consumable, notes from lab_data where lab_id = ?;", labId)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error getting lab data for lab id %d: %v", labId, err)
		return nil, fmt.Errorf("error getting lab data: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var labDatum LabData
		var consumable uint8

		err = rows.Scan(&labDatum.Id, &labDatum.Type, &labDatum.TypeId, &labDatum.QuantityPerStation, &labDatum.QuantityOnFrontTable, &consumable, &labDatum.Notes)
		if err != nil {
			runtime.LogErrorf(a.ctx, "error scanning lab data: %v", err)
			continue
		}

		if labDatum.Type == AssetType {
			err = a.db.QueryRow("select item_name, location from equipment where id = ?;", labDatum.TypeId).Scan(&labDatum.Name, &labDatum.Location)
			if err != nil {
				runtime.LogErrorf(a.ctx, "error scanning lab asset data from equipment table: %v", err)
				continue
			}
		} else if labDatum.Type == GroupType {
			err = a.db.QueryRow("select name from `groups` where id = ?;", labDatum.TypeId).Scan(&labDatum.Name)
			if err != nil {
				runtime.LogErrorf(a.ctx, "error scanning lab group data from groups table: %v", err)
				continue
			}
		} else if labDatum.Type == SetType {
			err = a.db.QueryRow("select name from sets where id = ?;", labDatum.TypeId).Scan(&labDatum.Name)
			if err != nil {
				runtime.LogErrorf(a.ctx, "error scanning lab set data from sets table: %v", err)
				continue
			}
		} else {
			runtime.LogErrorf(a.ctx, "unknown lab data type: %v", labDatum.Type)
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

func (a *App) UpdateLabData(id int64, field string, newValue string) error {
	var err error

	switch field {
	case "notes":
		var notes sql.NullString
		if len(newValue) > 0 {
			notes = sql.NullString{String: newValue, Valid: true}
		} else {
			notes = sql.NullString{String: "", Valid: false}
		}
		_, err = a.db.Exec("update lab_data set notes = ? where id = ?;", notes, id)
	case "consumable":
		var consumable bool
		if newValue == "true" {
			consumable = true
		} else if newValue == "false" {
			consumable = false
		} else {
			err = fmt.Errorf("unknown consumable value: %v", newValue)
			break
		}
		_, err = a.db.Exec("update lab_data set consumable = ? where id = ?;", consumable, id)
	case "quantityPerStation":
		if len(newValue) == 0 {
			err = fmt.Errorf("quantityPerStation is required")
			break
		}
		_, err = a.db.Exec("update lab_data set quantity_per_station = ? where id = ?;", newValue, id)
	case "quantityOnFrontTable":
		if len(newValue) == 0 {
			err = fmt.Errorf("quantityOnFrontTable is required")
			break
		}
		_, err = a.db.Exec("update lab_data set quantity_on_front_table = ? where id = ?;", newValue, id)
	default:
		err = fmt.Errorf("unknown field: %v", field)
	}

	if err != nil {
		runtime.LogErrorf(a.ctx, "error updating lab data: %v", err)
		return fmt.Errorf("error updating lab data: %v", err)
	}

	return nil
}

func (a *App) RemoveLabData(id int64) error {
	_, err := a.db.Exec("delete from lab_data where id = ?;", id)
	if err != nil {
		runtime.LogErrorf(a.ctx, "error removing lab data: %v", err)
		return fmt.Errorf("error removing lab data: %v", err)
	}

	return nil
}
