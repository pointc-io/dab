package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
)

func main() {
	if runtime.GOOS != "darwin" {
		fmt.Println("only launches on macOS")
		return
	}

	executable, err := os.Executable()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(executable)

	execPath := executable
	dir := filepath.Dir(filepath.Dir(executable))
	execPath = filepath.Join(dir, "bin", "app")

	if _, err := os.Stat(execPath); os.IsNotExist(err) {
		fmt.Println("could not find the app binary at '" + execPath + "'")
		return
	}

	fmt.Println(execPath)

	process, err := os.StartProcess(execPath, []string{}, &os.ProcAttr{})
	//cmd := exec.Command(execPath, os.Args...)
	//err = cmd.Start()

	if err != nil {
		fmt.Println(err)
	}

	process.Wait()
}
