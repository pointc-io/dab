// +build windows

package main

import (
	"os"
	"path/filepath"
)

const utnmBinary = "host.exe"
const untraceableBinary = "untraceable.exe"

// guessUntraceablePath makes a platform-specific guess to where the binary might
// be. This is only checked as a last-ditch effort when we can't find the
// binary in other places.
func guessKeybasePath(name string) string {
	return filepath.Join(os.Getenv("LOCALAPPDATA"), "Untraceable", name)
}
