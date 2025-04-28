package main

type AccessLevel uint8

const (
	Viewer        AccessLevel = 0
	Maintainer    AccessLevel = 1
	Administrator AccessLevel = 2
)
