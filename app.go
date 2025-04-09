package main

import (
	"context"
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const DBHost = "localhost:3306"

// App struct
type App struct {
	ctx      context.Context
	db       *sql.DB
	username string
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

func (a *App) Login(username string, password string) (bool, error) {
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/physics_inventory", username, password, DBHost))
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false, err
	}

	err = db.Ping()
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false, err
	}

	checkExistsStmt, err := db.Prepare("select exists(select 1 from users where username = ?);")
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false, err
	}

	var checkExistsResult int
	err = checkExistsStmt.QueryRow(username).Scan(&checkExistsResult)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false, err
	}
	defer checkExistsStmt.Close()

	if checkExistsResult != 1 {
		insertUserStmt, err := db.Prepare("insert into users (username) value (?);")
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			return false, err
		}
		defer insertUserStmt.Close()

		_, err = insertUserStmt.Exec(username)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			return false, err
		}
	}

	a.db = db
	a.username = username
	return true, nil
}
