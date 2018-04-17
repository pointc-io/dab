// +build !windows

package main

import (
	"path/filepath"
)

const utnmBinary = "utnm"
const untraceableBinary = "untraceable"

// guessUntraceablePath makes a platform-specific guess to where the binary might
// be. This is only checked as a last-ditch effort when we can't find the
// binary in other places.
func guessUntraceablePath(name string) string {
	return filepath.Join("/usr/local/bin", name)
}
