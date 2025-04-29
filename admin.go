package main

import "fmt"

type AccessLevel uint8

const (
	Viewer        AccessLevel = 0
	Maintainer    AccessLevel = 1
	Administrator AccessLevel = 2
)

type User struct {
	Username    string `json:"username"`
	AccessLevel uint8  `json:"accessLevel"` // todo change to AccessLevel type once Wails generates the bindings properly
}

func (a *App) GetUsers() ([]User, error) {
	if ok := a.verifyAdminAccess(); ok {
		rows, err := a.db.Query("select username, access_level from users;")
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		var users = make([]User, 0, 15)

		for rows.Next() {
			var username string
			var accessLevel uint8

			err := rows.Scan(&username, &accessLevel)
			if err != nil {
				return nil, err
			}

			users = append(users, User{username, accessLevel})
		}

		return users, nil
	}

	return nil, fmt.Errorf("insufficient privileges")
}

func (a *App) DeleteUser(username string) error {
	if ok := a.verifyAdminAccess(); ok {
		_, err := a.db.Exec("delete from users where username = ?;", username)
		if err != nil {
			return err
		}

		return nil
	}

	return fmt.Errorf("insufficient privileges")
}

func (a *App) UpdateUserAccessLevel(user User) error {
	// validate access level is within range
	// NOTE: validation for values less than zero is not necessary
	// due to accessLevel being an unsigned int
	if AccessLevel(user.AccessLevel) > Administrator {
		return fmt.Errorf("invalid access level")
	}

	if ok := a.verifyAdminAccess(); ok {
		_, err := a.db.Exec("update users set access_level = ? where username = ?;", user.AccessLevel, user.Username)
		if err != nil {
			return err
		}

		return nil
	}

	return fmt.Errorf("insufficient privileges")
}

func (a *App) verifyAdminAccess() bool {
	return a.accessLevel == Administrator
}

func (a *App) verifyMaintainerAccess() bool {
	return a.accessLevel >= Maintainer
}
