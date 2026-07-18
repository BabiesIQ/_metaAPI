// babiesiq — Official CLI for the BabiesIQ platform
//
// Usage: babiesiq <command> [flags]
// Commands:
//   status      Show API and service health
//   whoami      Show the current authenticated user
//   version     Print the CLI version
//   doctor      Diagnose common configuration issues
//   logout      Clear stored credentials
//   help        Show this help text
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

const (
	cliVersion = "2.0.0"
	defaultAPI = "https://api.babiesiq.tech"
	configFile = ".babiesiq"
)

// ─── Config ───────────────────────────────────────────────────────────────────

type cliConfig struct {
	APIKey  string `json:"api_key"`
	BaseURL string `json:"base_url"`
	Email   string `json:"email"`
}

func configPath() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return configFile
	}
	return filepath.Join(home, configFile)
}

func loadConfig() cliConfig {
	data, err := os.ReadFile(configPath())
	if err != nil {
		return cliConfig{BaseURL: defaultAPI}
	}
	var cfg cliConfig
	_ = json.Unmarshal(data, &cfg)
	if cfg.BaseURL == "" {
		cfg.BaseURL = defaultAPI
	}
	return cfg
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

func apiGET(url, apiKey string) (map[string]interface{}, int, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("User-Agent", "babiesiq-cli/"+cliVersion)
	if apiKey != "" {
		req.Header.Set("X-API-Key", apiKey)
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	_ = json.Unmarshal(body, &result)
	return result, resp.StatusCode, nil
}

// ─── Output helpers ───────────────────────────────────────────────────────────

func success(msg string) { fmt.Printf("\033[32m✓\033[0m %s\n", msg) }
func warn(msg string)    { fmt.Printf("\033[33m⚠\033[0m %s\n", msg) }

func header(title string) {
	fmt.Printf("\n\033[1m%s\033[0m\n%s\n", title, strings.Repeat("─", len(title)))
}

func kv(key, value string) {
	fmt.Printf("  \033[2m%-18s\033[0m %s\n", key+":", value)
}

func exitErr(msg string) {
	fmt.Fprintf(os.Stderr, "\033[31m✗\033[0m %s\n", msg)
	os.Exit(1)
}

// ─── Commands ─────────────────────────────────────────────────────────────────

func cmdVersion() {
	fmt.Printf("babiesiq CLI v%s (%s/%s)\n", cliVersion, runtime.GOOS, runtime.GOARCH)
}

func cmdStatus() {
	cfg := loadConfig()
	header("BabiesIQ Status")

	result, code, err := apiGET(cfg.BaseURL+"/health", "")
	if err != nil {
		warn("API: unreachable — " + err.Error())
		return
	}
	if code == 200 {
		version := ""
		if v, ok := result["version"].(string); ok {
			version = " (v" + v + ")"
		}
		success("API: online" + version)
	} else {
		warn(fmt.Sprintf("API: HTTP %d", code))
	}
	kv("Endpoint", cfg.BaseURL)
}

func cmdWhoami() {
	cfg := loadConfig()
	if cfg.APIKey == "" {
		exitErr("No credentials stored. Set api_key in " + configPath())
	}
	header("Current Identity")
	if cfg.Email != "" {
		kv("Email", cfg.Email)
	}
	kv("API Key", maskKey(cfg.APIKey))
	kv("Endpoint", cfg.BaseURL)
}

func cmdDoctor() {
	header("BabiesIQ Doctor")

	cfg := loadConfig()
	cfgPath := configPath()
	if _, err := os.Stat(cfgPath); err == nil {
		success("Config file found: " + cfgPath)
	} else {
		warn("Config file not found: " + cfgPath)
	}

	if cfg.APIKey != "" {
		success("API key set (" + maskKey(cfg.APIKey) + ")")
	} else {
		warn("No API key in config — add api_key to " + cfgPath)
	}

	_, code, err := apiGET(cfg.BaseURL+"/health", "")
	if err != nil {
		warn("Cannot reach API: " + err.Error())
		return
	}
	if code == 200 {
		success("API is reachable at " + cfg.BaseURL)
	} else {
		warn(fmt.Sprintf("API returned HTTP %d at %s", code, cfg.BaseURL))
	}
}

func cmdLogout() {
	cfgPath := configPath()
	if err := os.Remove(cfgPath); err != nil && !os.IsNotExist(err) {
		exitErr("Could not remove config: " + err.Error())
	}
	success("Logged out. Config removed from " + cfgPath)
}

func cmdHelp() {
	fmt.Printf(`
babiesiq CLI v%s

USAGE:
  babiesiq <command>

COMMANDS:
  status      Check API health and endpoint
  whoami      Show stored identity and API key
  doctor      Diagnose configuration issues
  logout      Remove stored credentials
  version     Print CLI version
  help        Show this help

CONFIGURATION:
  Credentials are stored in %s
  Edit it directly to set api_key, base_url, and email.

  Example (~/.babiesiq):
    {
      "api_key": "biq_...",
      "base_url": "https://api.babiesiq.tech",
      "email": "you@example.com"
    }

DOCUMENTATION:
  https://babiesiq.tech/docs

`, cliVersion, configPath())
}

func maskKey(key string) string {
	if len(key) <= 8 {
		return "****"
	}
	return key[:4] + strings.Repeat("*", len(key)-8) + key[len(key)-4:]
}

// ─── Entry point ──────────────────────────────────────────────────────────────

func main() {
	args := os.Args[1:]
	cmd := "help"
	if len(args) > 0 {
		cmd = args[0]
	}

	switch cmd {
	case "version", "--version", "-v":
		cmdVersion()
	case "status":
		cmdStatus()
	case "whoami":
		cmdWhoami()
	case "doctor":
		cmdDoctor()
	case "logout":
		cmdLogout()
	case "help", "--help", "-h":
		cmdHelp()
	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\nRun 'babiesiq help' for usage.\n", cmd)
		os.Exit(1)
	}
}
