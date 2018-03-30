package browser

import (
	"fmt"
	"testing"
	"time"
)

func TestChromeContext_Launch(t *testing.T) {
	browser := NewChrome()
	defer browser.Close()

	err := browser.Launch()
	if err != nil {
		fmt.Errorf("Error: %s", err)
		return
	}

	select {
	case <-browser.Done():
		fmt.Println("Was Canceled")
		// Wait for result
		fmt.Println("Waiting for Result")
		res, _ := <-browser.ChanResult
		fmt.Printf("Result: %s\n", res)

	case result, ok := <-browser.ChanResult:
		if !ok {
			fmt.Println("Canceled")
			return
		}

		if result != nil {
			fmt.Printf("Result: %s", result)
		}

	case <-time.After(time.Second * 300):
		fmt.Println("Timed Out!")
		browser.Close()

		// Wait for result
		fmt.Println("Waiting for Result")
		res, _ := <-browser.ChanResult
		fmt.Printf("Result: %s\n", res)
	}
}
