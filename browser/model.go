package browser

import "os"

type Result struct {
	State *os.ProcessState
	Error error
}

type Process interface {
	Close()

	Done() <-chan struct{}

	Launch() error
}

//
type Profile interface {
	IsEphemeral() bool

	Path() string
}

type Browser int
const (
	Chrome Browser = iota
	Chromium
	Opera
	Edge
	Safari
	Yandex
	Firefox
)

type OS int
const (
	MacOS OS = iota
	IOS
	Windows
	Linux
	Android
)

type Platform int
const (
	Desktop Platform = iota
	Mobile
)