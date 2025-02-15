# psikus

Psikus is a command-line tool for running performance tests on websites using Google PageSpeed Insights (PSI) API or locally with Lighthouse. It allows you to perform multiple runs, calculate median scores, and display results in different formats.

## Features

*   **Runs multiple tests:**  Performs several consecutive tests to get more reliable results.
*   **Calculates median:** Calculates the median score and other metrics from multiple runs to reduce the impact of outliers.
*   **Uses PSI API or Lighthouse:** Allows you to choose between using the online Google PageSpeed Insights API or running Lighthouse locally in a headless Chrome browser.
*   **Flexible output:**  Displays results in a "pretty" (table) format or as JSON.
*   **Detailed metrics:** Provides a comprehensive set of performance metrics, including:
    *   First Contentful Paint (FCP)
    *   Largest Contentful Paint (LCP)
    *   First Meaningful Paint (FMP)
    *   Speed Index (SI)
    *   Total Blocking Time (TBT)
    *   Cumulative Layout Shift (CLS)
    *   First CPU Idle (FCI)
    *   Time to Interactive (TTI)
    * Number of requests (total, first-party, third-party)
    * Transfer size and resource size, aggregated by host and resource type
    * DOM size
    * Fetch time

*   **PSI Score Calculation (v6, v8, v10):** Calculates PSI scores based on different Lighthouse versions' weighting.
*   **Request Blocking (Lighthouse only):** Ability to block specific URLs during Lighthouse runs.
*   **URL Randomization:**  Appends a random query parameter to the URL for each run to help prevent caching issues.
* **Basic Request Grouping:** Groups requests by host and resource type, providing insights into first-party vs. third-party resources.

## Installation

```bash
npm install -g psikus
```
You also need Chrome installed on the system if running in the local mode.

## Usage

```bash
psikus <url> [options]
```

**`<url>`:** The URL of the website to test (required).  The URL will be automatically prepended with `http://` if no protocol is specified.

**Options:**

*   `--runs <number>`:  The number of test runs to perform (default: 3).
*   `--display <format>`:  The output format: `pretty` (default) or `json`.
*   `--local`:  Use Lighthouse to run tests locally instead of using the PageSpeed Insights API (default: false).
*   `--strategy <strategy>`:  The analysis strategy for the PSI API: `mobile` (default) or `desktop`.
*   `--block <pattern1,pattern2,...>`: (Lighthouse only) Comma-separated list of URL patterns to block. Supports wildcards.  Example: `--block "*.youtube.com,*.doubleclick.net"`
*  `--label`:  add a label to results.

**Examples:**

1.  **Run using the PSI API (requires an API key) with 5 runs, displaying results as JSON:**

    ```bash
    psikus https://www.example.com --key YOUR_API_KEY --runs 5 --display json
    ```

2.  **Run locally using Lighthouse with the default 3 runs, displaying results in the pretty format:**

    ```bash
    psikus https://www.example.com --local
    ```

3. **Run locally using Lighthouse, blocking specific URLs and performing 7 runs:**

    ```bash
    psikus https://www.example.com --local --runs 7 --block "*.ads.com,*.track.com"
    ```
4.  **Run using the PSI API with the desktop strategy:**

    ```bash
    psikus https://www.example.com --key YOUR_API_KEY --strategy desktop
    ```
5. Run locally using Lighthouse with label:

    ```bash
    psikus https://www.example.com --local --label "my-test-run"
    ```

## Output (Pretty Format)

The "pretty" output format displays the median results in tables:

*   **PSI Scores:**  v6, v8, and v10 PSI scores.
*   **Metrics:**  Individual metric values (e.g., FCP, LCP, TBT) with their scores and titles.
*   **Fetch Time:** The time Lighthouse took to fetch the page.
*   **DOM:** The number of DOM nodes.
*  **Requests Breakdown (br):** Transfer size and resource size, aggregated by resource type.
*  **Requests by Host (hosts):** Transfer size, resource size, and the number of requests for each host.
*  **Request Summary (summary):** Total requests, broken down into first-party and third-party counts.

## Output (JSON Format)

The "json" output provides the median data as a JSON object, including all the information from the pretty format, as well as the screenshot data (base64 encoded).
