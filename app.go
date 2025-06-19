package main

import (
	"context"
	"database/sql"
	_ "embed"
	"errors"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/tidwall/gjson"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const DBHost = "localhost:3306"

//go:embed wails.json
var wailsJSON string

// App struct
type App struct {
	ctx         context.Context
	db          *sql.DB
	username    string
	accessLevel AccessLevel
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	version, err := a.GetProductVersion()
	runtime.LogInfof(ctx, "Starting application...\nVersion: %s", version)
	if err != nil {
		runtime.LogErrorf(ctx, "%v", err)
	}
}

func (a *App) shutdown(ctx context.Context) {
	runtime.LogInfo(ctx, "Shutting down...")
	if a.db != nil {
		_ = a.db.Close()
	}
}

func (a *App) GetProductVersion() (string, error) {
	productVersion := gjson.Get(wailsJSON, "info.productVersion")
	if productVersion.Exists() {
		return productVersion.String(), nil
	} else {
		return "", errors.New("productVersion not found")
	}
}

func (a *App) Login(username string, password string) (uint8, error) {
	runtime.LogInfof(a.ctx, "Logging in user: %s", username)
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/physics_inventory?parseTime=true", username, password, DBHost))
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return uint8(Viewer), err
	}

	// check to see if we can log in with the supplied credentials
	err = db.Ping()
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return uint8(Viewer), err
	}

	// get the user's access level from the DB
	// if it doesn't exist, insert the user into the table with default access
	var accessLevel uint8
	err = db.QueryRow("select access_level from users where username = ?;", username).Scan(&accessLevel)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			_, err = db.Exec("insert into users (username) values (?);", username)
			if err != nil {
				runtime.LogError(a.ctx, err.Error())
				return uint8(Viewer), err
			}
			accessLevel = uint8(Viewer)
		} else {
			runtime.LogError(a.ctx, err.Error())
			return uint8(Viewer), err
		}
	}

	a.db = db
	a.username = username
	a.accessLevel = AccessLevel(accessLevel)
	return accessLevel, nil
}
