package main

import (
	"encoding/json"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const githubAPIURl = "https://api.github.com"
const githubAPIVersion = "2022-11-28"
const githubRepoName = "nathanaelg16/physics-inventory"

type release struct {
	Name string `json:"name"`
	Tag  string `json:"tag_name"`
}

type versionInfo struct {
	Major int
	Minor int
	Patch int
}

func (a *App) CheckForUpdates() bool {
	runtime.LogInfof(a.ctx, "Checking for updates...")
	release, err := a.getLatestRelease()
	if err != nil {
		runtime.LogInfof(a.ctx, "Failed to get latest release: %v", err)
		return false
	}

	currentVersion, err := a.GetProductVersion()
	if err != nil {
		runtime.LogInfof(a.ctx, "Failed to get current version: %v", err)
		return false
	}

	releaseVersion := release.Tag

	updateFound := compareVersions(currentVersion, releaseVersion)
	if updateFound {
		runtime.LogInfof(a.ctx, "New update found: v%s", releaseVersion)
	} else {
		runtime.LogInfof(a.ctx, "No updates found. Latest release version is: %s", releaseVersion)
	}

	return updateFound
}

func (a *App) getLatestRelease() (*release, error) {
	runtime.LogInfof(a.ctx, "Getting latest release...")
	url := fmt.Sprintf("%s/repos/%s/releases/latest", githubAPIURl, githubRepoName)

	client := &http.Client{
		Timeout: time.Second * 10,
	}

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP GET request: %v", err)
	}

	req.Header.Add("Accept", "application/vnd.github+json")
	req.Header.Add("X-GitHub-Api-Version", githubAPIVersion)
	req.Header.Add("User-Agent", githubRepoName)

	res, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make HTTP GET request for latest release: %v", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch latest release: GitHub API returned status code %d", res.StatusCode)
	}

	var release release
	if err := json.NewDecoder(res.Body).Decode(&release); err != nil {
		return nil, fmt.Errorf("failed to decode JSON response: %v", err)
	}

	return &release, nil
}

func compareVersions(currentVersion string, releaseVersion string) bool {
	currentVersionInfo, err := parseVersionInfo(currentVersion)
	if err != nil {
		return false
	}

	releaseVersionInfo, err := parseVersionInfo(releaseVersion)
	if err != nil {
		return false
	}

	if releaseVersionInfo.Major != currentVersionInfo.Major {
		return releaseVersionInfo.Major > currentVersionInfo.Major
	}

	if releaseVersionInfo.Minor != currentVersionInfo.Minor {
		return releaseVersionInfo.Minor > currentVersionInfo.Minor
	}

	return releaseVersionInfo.Patch > currentVersionInfo.Patch
}

func parseVersionInfo(version string) (*versionInfo, error) {
	version = strings.TrimPrefix(version, "v")
	versionParts := strings.Split(version, ".")

	if len(versionParts) != 3 {
		return nil, fmt.Errorf("failed to parse version: %s", version)
	}

	major, err := strconv.Atoi(versionParts[0])
	if err != nil {
		return nil, fmt.Errorf("failed to parse major version: %v", err)
	}

	minor, err := strconv.Atoi(versionParts[1])
	if err != nil {
		return nil, fmt.Errorf("failed to parse minor version: %v", err)
	}

	patch, err := strconv.Atoi(versionParts[2])
	if err != nil {
		return nil, fmt.Errorf("failed to parse patch version: %v", err)
	}

	return &versionInfo{
		Major: major,
		Minor: minor,
		Patch: patch,
	}, nil
}
