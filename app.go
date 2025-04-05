package main

import (
	"context"
	"database/sql"
	"fmt"

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
