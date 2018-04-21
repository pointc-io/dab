// +build mage

package main

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
)

const (
	GO_VERSION     = "1.10.1"
	APP_PATH       = "github.com/pointc-io/dab/cmd/app"
	MAC_TARGET     = "darwin-10.9/amd64"
	WIN_TARGET     = "windows/*"
	LINUX_TARGET   = ""
	PKG_PREFIX_LEN = len("github.com/pointc-io/dab")
)

var pkgPrefixLen = len("github.com/pointc-io/dab")

// allow user to override go executable by running as GOEXE=xxx make ... on unix-like systems
var goexe = "go"
var gopath = os.Getenv("GOPATH")
var gobin = os.Getenv("GOBIN")

// Initialize
func init() {
	mg.Verbose()
	if exe := os.Getenv("GOEXE"); exe != "" {
		goexe = exe
	}
	if gobin == "" {
		gobin = filepath.Join(gopath, "bin")
	}
}

//
//
//
func Clean() {
	fmt.Println("Cleaning...")
	fmt.Println("Cleaned")
}

//
//
//
func Vendor() error {
	mg.Deps(getDep)
	return sh.Run("dep", "ensure")
}

//
//
//
func Vendor_rebuild() error {
	mg.Deps(getDep)
	sh.Rm("vendor")
	return sh.Run("dep", "ensure")
}

//
//
//
func Configure() {
	mg.Deps(getDep, getGoBinData, getXGO)
	Vendor()
}

//
//
// Run a build on all Go and Javascript projects
func Build() {
	fmt.Println("Building...")
	Build_mac()
	fmt.Println("Built!")
}

func Release() {

}

func Build_mac() error {
	var err error
	fmt.Println("Building for macOS...")
	//if err = os.Chdir("cmd"); err != nil {
	//	return err
	//}
	//if err = os.Chdir("app"); err != nil {
	//	return err
	//}
	if err = sh.RunV("xgo", "--targets="+MAC_TARGET, "-go", GO_VERSION, APP_PATH); err != nil {
		return err
	}

	// Create app bundle

	return nil
}

func Build_win() error {
	var err error
	fmt.Println("Building for Windows...")
	//if err = os.Chdir("cmd"); err != nil {
	//	return err
	//}
	//if err = os.Chdir("app"); err != nil {
	//	return err
	//}
	if err = sh.RunV("xgo", "--targets="+WIN_TARGET, "-go", GO_VERSION, APP_PATH); err != nil {
		return err
	}

	// Create app bundle

	return nil
}

func Build_linux() error {
	var err error
	fmt.Println("Building for Linux / Gtk+3...")
	//if err = os.Chdir("cmd"); err != nil {
	//	return err
	//}
	//if err = os.Chdir("app"); err != nil {
	//	return err
	//}
	if err = sh.RunV("xgo", "--targets="+LINUX_TARGET, "-go", GO_VERSION, APP_PATH); err != nil {
		return err
	}

	// Create app bundle

	return nil
}

func Build_js() error {
	return nil
}

//
//
//
func Build_ext() error {
	start := time.Now()
	fmt.Println("build_ext started...")

	fmt.Println("Changing to 'ext' directory")
	// Change to ./ui directory
	if err := os.Chdir("ext"); err != nil {
		return err
	}

	fmt.Println("Cleaning 'build' directory")
	// Clean build directory
	sh.Rm("build")

	fmt.Println("Running 'yarn run build'")
	// Run a yarn build
	if err := sh.RunV("yarn", "run", "build"); err != nil {
		return err
	}

	fmt.Println("Changing directory to source root")
	// Change back to source root directory
	if err := os.Chdir("../"); err != nil {
		return err
	}

	fmt.Println("Cleaning 'assets/ext' directory")
	// Silently clean output directory
	sh.Rm(filepath.Join("assets", "ext"))

	fmt.Println("Running go-bindata")
	//// Embed in Go
	//if err := sh.RunV(
	//	"go-bindata",
	//	"-nomemcopy",
	//	"-pkg", "ext_data",
	//	"-o",
	//	filepath.Join("assets", "ext", "data.go"),
	//	filepath.Join("ext", "build", "..."));
	//	err != nil {
	//	return err
	//}

	// Embed in Go
	if err := sh.RunV(
		"go-bindata",
		"-nomemcopy",
		"-pkg", "ext_chrome_data",
		"-o",
		filepath.Join("assets", "ext", "chrome", "data.go"),
		filepath.Join("ext", "build", "chrome"));
		err != nil {
		return err
	}
	if err := sh.RunV(
		"go-bindata",
		"-nomemcopy",
		"-pkg", "ext_firefox_data",
		"-o",
		filepath.Join("assets", "ext", "firefox", "data.go"),
		filepath.Join("ext", "build", "firefox"));
		err != nil {
		return err
	}
	if err := sh.RunV(
		"go-bindata",
		"-nomemcopy",
		"-pkg", "ext_opera_data",
		"-o",
		filepath.Join("assets", "ext", "opera", "data.go"),
		filepath.Join("ext", "build", "opera"));
		err != nil {
		return err
	}

	fmt.Println(fmt.Sprintf("build_ext successfully executed in %s", time.Now().Sub(start)))
	return nil
}

//
//
//
func Build_ui() error {
	start := time.Now()
	fmt.Println("build_ui started...")

	fmt.Println("Changing to 'ui' directory")
	// Change to ./ui directory
	if err := os.Chdir("ui"); err != nil {
		return err
	}

	fmt.Println("Cleaning 'dist' directory")
	// Clean build directory
	sh.Rm("dist")

	fmt.Println("Running 'yarn run build'")
	// Run a yarn build
	if err := sh.RunV("yarn", "run", "build"); err != nil {
		return err
	}

	fmt.Println("Changing directory to source root")
	// Change back to source root directory
	if err := os.Chdir("../"); err != nil {
		return err
	}

	fmt.Println("Cleaning 'assets/ui' directory")
	// Silently clean output directory
	sh.Rm(filepath.Join("assets", "ui"))

	fmt.Println("Running go-bindata")
	// Embed in Go
	if err := sh.RunV(
		"go-bindata",
		"-nomemcopy",
		"-pkg", "ui_data",
		"-o",
		filepath.Join("assets", "ui", "data.go"),
		filepath.Join("ui", "dist"));
		err != nil {
		return err
	}

	fmt.Println(fmt.Sprintf("build_ui successfully executed in %s", time.Now().Sub(start)))
	return nil
}

// Run go vet linter
func Vet() error {
	mg.Deps(getDep)
	if err := sh.RunV(goexe, "vet", "./..."); err != nil {
		return fmt.Errorf("error running govendor: %v", err)
	}
	return nil
}

// Run gofmt linter
func Fmt() error {
	if !isGoLatest() {
		return nil
	}
	pkgs, err := packages()
	if err != nil {
		return err
	}
	failed := false
	first := true
	for _, pkg := range pkgs {
		files, err := filepath.Glob(filepath.Join(pkg, "*.go"))
		if err != nil {
			return nil
		}
		for _, f := range files {
			// gofmt doesn't exit with non-zero when it finds unformatted code
			// so we have to explicitly look for output, and if we find any, we
			// should fail this target.
			s, err := sh.Output("gofmt", "-l", f)
			if err != nil {
				fmt.Printf("ERROR: running gofmt on %q: %v\n", f, err)
				failed = true
			}
			if s != "" {
				if first {
					fmt.Println("The following files are not gofmt'ed:")
					first = false
				}
				failed = true
				fmt.Println(s)
			}
		}
	}
	if failed {
		return errors.New("improperly formatted go files")
	}
	return nil
}

// Run tests
func Test() error {
	return sh.Run(goexe, "test", "./...")
}

// Run tests with race detector
func TestRace() error {
	return sh.Run(goexe, "test", "-race", "./...")
}

//
//
// Generate test coverage report
func TestCoverHTML() error {
	mg.Deps(getDep)
	const (
		coverAll = "coverage-all.out"
		cover    = "coverage.out"
	)
	f, err := os.Create(coverAll)
	if err != nil {
		return err
	}
	defer f.Close()
	if _, err := f.Write([]byte("mode: count")); err != nil {
		return err
	}
	pkgs, err := packages()
	if err != nil {
		return err
	}
	for _, pkg := range pkgs {
		if err := sh.Run(goexe, "test", "-coverprofile="+cover, "-covermode=count", pkg); err != nil {
			return err
		}
		b, err := ioutil.ReadFile(cover)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return err
		}
		idx := bytes.Index(b, []byte{'\n'})
		b = b[idx+1:]
		if _, err := f.Write(b); err != nil {
			return err
		}
	}
	if err := f.Close(); err != nil {
		return err
	}
	return sh.Run(goexe, "tool", "cover", "-html="+coverAll)
}

//
//
// Verify that vendored packages match git HEAD
func Check_vendor() error {
	if err := sh.Run("git", "diff-index", "--quiet", "HEAD", "vendor/"); err != nil {
		// yes, ignore errors from this, not much we can do.
		sh.Exec(nil, os.Stdout, os.Stderr, "git", "diff", "vendor/")
		return errors.New("check-vendor target failed: vendored packages out of sync")
	}
	return nil
}

//
//
//
func Encode_logo() error {
	if err := chDir("assets", "logo"); err != nil {
		return err
	}

	if err := toGoArray(
		"logo.png",
		"logo_png.go",
		"logo",
		"Logo_Png",
	); err != nil {
		return err
	}

	if err := toGoArray(
		"logo.ico",
		"logo_ico.go",
		"logo",
		"Logo_Ico",
	); err != nil {
		return err
	}

	if err := toGoArray(
		"logo.icns",
		"logo_icns.go",
		"logo",
		"Logo_Icns",
	); err != nil {
		return err
	}

	return nil
}

//
//
// Utilities
//
//

// Change directory utility
func chDir(path ...string) error {
	for _, p := range path {
		if err := os.Chdir(p); err != nil {
			return err
		}
	}
	return nil
}

// Install dep
func getDep() error {
	return sh.RunV(goexe, "get", "-u", "github.com/golang/dep/cmd/dep")
}

func isGoBinDataInstalled() bool {
	_, err := os.Stat(filepath.Join(gobin, "go-bindata"));
	return err == nil
}
func getGoBinData() error {
	fmt.Println("go-bindata installing/updating...")
	if err := sh.RunV(goexe, "get", "-u", "github.com/jteeuwen/go-bindata/..."); err != nil {
		fmt.Println("go-bindata install failed", err)
		return err
	}
	return nil
}

func isXGOInstalled() bool {
	_, err := os.Stat(filepath.Join(gobin, "go-bindata"));
	return err == nil
}
func getXGO() error {
	fmt.Println("xgo installing/updating...")
	if err := sh.RunV(goexe, "get", "-u", "github.com/karalabe/xgo"); err != nil {
		fmt.Println("xgo install failed", err)
		return err
	}
	return nil
}

func packages() ([]string, error) {
	mg.Deps(getDep)
	s, err := sh.Output(goexe, "list", "./...")
	if err != nil {
		return nil, err
	}
	pkgs := strings.Split(s, "\n")
	for i := range pkgs {
		pkgs[i] = "." + pkgs[i][pkgPrefixLen:]
	}
	return pkgs, nil
}

func isGoLatest() bool {
	return strings.Contains(runtime.Version(), "1.10")
}

func toGoArray(inputFile, outputFile, packageName, varName string) error {
	logo, err := ioutil.ReadFile(inputFile)
	if err != nil {
		return err
	}

	buf := bytes.NewBuffer(make([]byte, 0))

	buf.WriteString("// GENERATED\n")
	buf.WriteString(fmt.Sprintf("package %s\n\n", packageName))
	buf.WriteString(fmt.Sprintf("var %s = []byte {", varName))

	var totalBytes int
	for _, b := range logo {
		if totalBytes%12 == 0 {
			buf.WriteString("\n\t")
		}
		buf.WriteString(fmt.Sprintf("0x%02x, ", b))
		totalBytes++
	}
	buf.WriteString("\n}\n\n")

	return ioutil.WriteFile(outputFile, buf.Bytes(), 0755)
}
