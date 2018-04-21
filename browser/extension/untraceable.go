package extension

import "github.com/blang/semver"

var (
	CHROME_MIN *semver.Version
	CHROME_EXT *semver.Version
)

func init() {
	var err error
	if CHROME_MIN, err = semver.New("56.0"); err != nil {

	}
	if CHROME_EXT, err = semver.New("0.1.0"); err != nil {

	}
}

func GenerateChrome(path string) {

}