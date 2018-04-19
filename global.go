package dab

import (
	"errors"
	"fmt"
	"os"
	"os/user"
	"path/filepath"

	"github.com/blang/semver"
	"github.com/rcrowley/go-metrics"
	"github.com/rs/zerolog"
)

var (
	// ErrNotFound is returned when an value or idx is not in the database.
	ErrNotFound = errors.New("not found")

	// ErrInvalid is returned when the database file is an invalid format.
	ErrInvalid = errors.New("invalid")
)

const Name = "untraceable"
const VersionStr = "0.1.0-1" // SemVer
var Version semver.Version
var GIT = ""
var Logger = CLILogger()
var Metrics = metrics.DefaultRegistry
var Path = ""

func init() {
	usr, err := user.Current()
	if err != nil {
		panic(err)
	}

	Path = filepath.Join(usr.HomeDir, fmt.Sprintf(".%s", Name))
	err = os.MkdirAll(Path, 0700)
	if err != nil {
		panic(err)
	}

	Version, err = semver.Make(VersionStr)
}

func CLILogger() zerolog.Logger {
	l := zerolog.New(zerolog.ConsoleWriter{
		Out:     os.Stdout,
		NoColor: false,
	})
	l = l.With().Timestamp().Logger()
	zerolog.SetGlobalLevel(zerolog.DebugLevel)
	return l
}

func DaemonLogger(dev bool) zerolog.Logger {
	if dev {
		return CLILogger()
	}

	//l := zerolog.New(os.Stdout)
	l := zerolog.New(zerolog.ConsoleWriter{
		Out:     os.Stdout,
		NoColor: false,
	})
	l = l.With().Timestamp().Logger()
	zerolog.SetGlobalLevel(zerolog.DebugLevel)
	return l
}
