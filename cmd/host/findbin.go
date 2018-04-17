package main

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/kardianos/osext"
)

var errUntraceableNotFound = errors.New("failed to find the untraceable binary")

// findUntraceableBinary returns the path to a Untraceable binary, if it finds it.
func findUntraceableBinary(name string) (string, error) {
	// Is it near the kbnm binary?
	dir, err := osext.ExecutableFolder()
	if err == nil {
		path := filepath.Join(dir, name)
		if _, err := os.Stat(path); !os.IsNotExist(err) {
			return path, nil
		}
	}

	// Is it in our PATH?
	path, err := exec.LookPath(name)
	if err == nil {
		return path, nil
	}

	// Last ditch effort!
	path = guessUntraceablePath(name)
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		return path, nil
	}

	return "", errUntraceableNotFound
}