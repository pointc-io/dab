package browser

import (
	"os"
	"fmt"
	"context"
	"time"
	"sync"
)

type ChromeContext struct {
	ctx    context.Context
	cancel context.CancelFunc

	timezone string
	dataDir  string
	extDir   string
	path     string
	execName string
	env      []string
	args     []string

	mu         sync.Mutex
	started    time.Time
	ended      time.Time
	closed     bool
	duration   time.Duration
	canceled   bool
	result     *Result
	proc       *os.Process
	ChanResult <-chan *Result
}

func NewChrome() *ChromeContext {
	ctx, cancel := context.WithCancel(context.Background())

	return &ChromeContext{
		path:     "/Applications/Opera.app/Contents/MacOS",
		//path:     "/Applications/Google Chrome.app/Contents/MacOS",
		//execName: "Google Chrome",
		execName: "Opera",
		env: []string{
			"TZ=America/Los_Angeles",
		},
		ctx:      ctx,
		cancel:   cancel,
		canceled: false,
		closed:   false,
		result:   nil,
		args: []string{
			"--flag-switches-begin",
			"--user-data-dir=/Users/clay/.dab/profiles/p4",
			"--disable-internal-flash",
			"--disable-bundled-ppapi-flash",
			"--disable-background-mode",
			"--disable-background-networking",
			"--disable-browser-side-navigation",
			"--disable-bundled-ppapi-flash",
			"--disable-client-side-phishing-detection",
			"--disable-default-apps",
			"--disable-hang-monitor",
			"--disable-infobars",
			"--disable-internal-flash",
			"--disable-popup-blocking",
			"--disable-prompt-on-repost",
			"--disable-sync",
			"--disable-web-resources",
			"--disable-web-security",
			"--enable-automation",
			"--enable-logging",
			"--force-fieldtrials=SiteIsolationExtensions/Control",
			"--proxy-server=localhost:8080",
			"--ignore-certificate-errors",
			//"--load-extension=/Users/clay/ut/ublock/1.14.17b0/uBlock0.chromium,/Users/clay/git/untraceable/cloud/browser/extension",
			"--load-extension=/Users/clay/go/src/github.com/pointc-io/dab/ext/build/chrome",
			"--log-level=0",
			"--metrics-recording-only",
			"--no-first-run",
			//"--password-store=basic",
			//"--remote-debugging-port=12646",
			"--safebrowsing-disable-auto-update",
			//"--test-type=webdriver",
			//"--use-mock-keychain",
			//"--disable-background-networking",
			"--cast-initial-screen-width=2000",
			"--cast-initial-screen-height=600",
			"--flag-switches-end",
		},
	}
}

func (c *ChromeContext) Done() <-chan struct{} {
	return c.ctx.Done()
}

func (c *ChromeContext) Launch() error {
	c.mu.Lock()
	if c.result != nil {
		c.mu.Unlock()
		return c.result.Error
	}
	c.mu.Unlock()
	return c.Run()
}

func (c *ChromeContext) Close() {
	c.cancel()
}

// Get Process
func (c *ChromeContext) Proc() *os.Process {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.proc
}

// Get Pid
func (c *ChromeContext) Pid() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.proc != nil {
		return c.proc.Pid
	} else {
		return -1
	}
}

// Get Result
func (c *ChromeContext) ProcResult() *Result {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.result
}

func (c *ChromeContext) Run() error {
	// Create a new process
	proc, err := os.StartProcess(
		c.execName,
		c.args,
		&os.ProcAttr{
			Dir:   c.path,
			Env:   c.env,
			Files: nil,
			Sys:   nil,
		},
	)

	if err != nil {
		return err
	}

	// Create Result chan
	chanResult := make(chan *Result)

	c.mu.Lock()
	c.started = time.Now()
	c.proc = proc
	c.ChanResult = chanResult
	c.mu.Unlock()

	// Wait for process to exit
	go func() {
		// Ensure channel is closed.
		defer close(chanResult)

		// Wait for exit.
		s, err := proc.Wait()

		c.mu.Lock()
		c.ended = time.Now()
		c.duration = time.Since(c.started)
		c.proc = nil
		c.closed = true
		// Set Result
		c.result = &Result{s, err}
		c.mu.Unlock()

		// Signal result.
		chanResult <- c.result
	}()

	// Listen for cancel
	go func() {
		select {
		case <-c.ctx.Done():
			c.mu.Lock()
			if c.closed {
				c.mu.Unlock()
				return
			}
			c.canceled = true
			c.mu.Unlock()

			fmt.Println("Canceling")
			proc.Kill()
			return
		}
	}()

	return nil
}
