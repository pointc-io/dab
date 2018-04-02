// Command simple is a chromedp example demonstrating how to do a simple google
// search.
package browser

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	"github.com/chromedp/cdproto/cdp"
	"github.com/chromedp/chromedp"
	"github.com/chromedp/chromedp/runner"
	"os/exec"
)

func RunBot() {
	var err error

	// create context
	ctxt, cancel := context.WithCancel(context.Background())
	defer cancel()

	var options []runner.CommandLineOption
	options = append(options, runner.UserDataDir("/Users/clay/.dab/profiles/d1"))
	options = append(options, runner.Path("/Applications/Opera.app/Contents/MacOS"))
	options = append(options, runner.ExecPath("/Applications/Opera.app/Contents/MacOS/Opera"))
	options = append(options, runner.Flag("load-extension", "/Users/clay/go/src/github.com/pointc-io/dab/patch/extension,/Users/clay/.dab/ublock/1.15.18/uBlock0.chromium"))
	options = append(options, runner.Flag("disable-infobars", nil))
	options = append(options, runner.CmdOpt(func(cmd *exec.Cmd) error {
		cmd.Env = append(cmd.Env, "TZ=America/Los_Angeles")
		return nil
	}))

	//r, err := runner.New(options...)

	var opts []chromedp.Option
	opts = append(opts, chromedp.WithLog(log.Printf))
	opts = append(opts, chromedp.WithRunnerOptions(options...))

	// create chrome instance
	c, err := chromedp.New(ctxt, opts...)
	if err != nil {
		log.Fatal(err)
	}

	//c.Run(ctxt, chromedp.Navigate("http://browserleaks.com/javascript"))
	//time.Sleep(time.Second * 10000)

	// run task list
	var site, res string
	err = c.Run(ctxt, googleSearch("site:brank.as", "Home", &site, &res))
	if err != nil {
		log.Fatal(err)
	}

	// shutdown chrome
	err = c.Shutdown(ctxt)
	if err != nil {
		log.Fatal(err)
	}

	// wait for chrome to finish
	err = c.Wait()
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("saved screenshot from search result listing `%s` (%s)", res, site)
}

func googleSearch(q, text string, site, res *string) chromedp.Tasks {
	var buf []byte
	sel := fmt.Sprintf(`//a[text()[contains(., '%s')]]`, text)
	return chromedp.Tasks{
		chromedp.Navigate(`https://www.google.com`),
		chromedp.WaitVisible(`#hplogo`, chromedp.ByID),
		chromedp.SendKeys(`#lst-ib`, q+"\n", chromedp.ByID),
		chromedp.WaitVisible(`#res`, chromedp.ByID),
		chromedp.Text(sel, res),
		chromedp.Click(sel),
		chromedp.WaitNotVisible(`.preloader-content`, chromedp.ByQuery),
		chromedp.WaitVisible(`a[href*="twitter"]`, chromedp.ByQuery),
		chromedp.Location(site),
		chromedp.ScrollIntoView(`.banner-section.third-section`, chromedp.ByQuery),
		chromedp.Sleep(2 * time.Second), // wait for animation to finish
		chromedp.Screenshot(`.banner-section.third-section`, &buf, chromedp.ByQuery),
		chromedp.ActionFunc(func(context.Context, cdp.Executor) error {
			return ioutil.WriteFile("screenshot.png", buf, 0644)
		}),
	}
}