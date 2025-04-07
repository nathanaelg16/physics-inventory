package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

const DBHost = "localhost:3306"

// App struct
type App struct {
	ctx context.Context
	db  *sql.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		_ = a.db.Close()
	}
}

func (a *App) Login(username string, password string) bool {
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/physics_inventory", username, password, DBHost))
	if err != nil {
		fmt.Println(err.Error())
		return false
	}

	err = db.Ping()
	if err != nil {
		fmt.Println(err.Error())
		return false
	}

	a.db = db
	return true
}

func (a *App) Search(query string) []Asset {
	asset1 := Asset{
		id:              1,
		name:            "Dynamics cart",
		location:        "HYH-231-A1",
		keywords:        "dynamics, cart",
		brand:           "Dynamo",
		model:           "SpeedRacer",
		part:            "DSR-800",
		quantity:        "1",
		purchaseDate:    time.Date(2025, time.January, 1, 0, 0, 0, 0, time.UTC),
		purchaseAmount:  "$99.00",
		missing:         false,
		quantityMissing: "",
		recordLocator:   -1,
	}

	// todo add a few assets into the database with images, configure this method to fetch from db and return results

	return []Asset{asset1}
}
