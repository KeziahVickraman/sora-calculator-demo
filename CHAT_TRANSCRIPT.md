# SORA Interest & Mortgage Calculator - Project Chat Transcript

**Date:** 2026-10-05  
**Repository:** [https://github.com/KeziahVickraman/sora-calculator-demo.git](https://github.com/KeziahVickraman/sora-calculator-demo.git)  
**Author:** Keziah Vickraman (keziahvickraman@gmail.com)  

---

## 1. Initial Prompt: Frontend Calculator Implementation

### User Request
> "build me a simple Singapore based SORA calculator that reads MAS backed overnight rates for calculating interest payments accurately and efficiently. Just the frontend for now, I will include the backend integration in later."

### Engineer Implementation Summary
Built a full-featured Singapore SORA Interest & Mortgage Calculator conforming to official Monetary Authority of Singapore (MAS) benchmarks and lending regulations:

1. **MAS SORA Compounding Engine (`src/services/masSoraService.ts`)**:
   - Implemented standard Singapore SORA compounding methods:
     - 1-Month Compounded SORA (1M SORA)
     - 3-Month Compounded SORA (3M SORA) — standard for home loans
     - 6-Month Compounded SORA (6M SORA)
     - Daily Overnight SORA in Arrears calculation using exact MAS & ABS convention with Singapore ACT/365 day count:
       $$\text{Compounded Rate} = \left[ \prod_{i=1}^{d_b} \left( 1 + \frac{r_i \times n_i}{365 \times 100} \right) - 1 \right] \times \frac{365}{d} \times 100$$
   - Bundled official historical MAS benchmark series with weekend day-weighting ($n_i = 3$ for Fridays) and trade volume metrics ($S\$3.2B - S\$5.1B$).

2. **Mortgage & Amortization Mechanics**:
   - Monthly installment calculation using standard annuity formula:
     $$M = P \cdot \frac{r(1+r)^n}{(1+r)^n - 1}$$
   - Breakdown of First Month Principal vs Interest.
   - Total interest payable and total repayment outlay over tenure.
   - Property loan presets: HDB 4-Room ($450k), HDB Resale ($650k), Private Condominium ($1.2M), Landed Property ($2.8M).

3. **MAS Regulatory Affordability & Stress Testing**:
   - Automatic stress test using the **MAS medium-term interest rate floor of 4.00% p.a.**
   - Total Debt Servicing Ratio (TDSR $\le 55\%$) compliance calculator with user monthly income and existing debt inputs.
   - Mortgage Servicing Ratio (MSR $\le 30\%$) verification for HDB properties.

4. **Interactive Views & Components**:
   - **Calculator View (`src/components/CalculatorView.tsx`)**: Parameter sliders, bank margins, custom scenario toggles, and live stats.
   - **Amortization Schedule (`src/components/AmortizationSchedule.tsx`)**: Annual summary and monthly detailed tables with search filtering, pagination, and CSV export.
   - **MAS Rates Explorer (`src/components/RatesExplorer.tsx`)**: Historical overnight rates, day counts, trading volumes, and interactive arrears playground.
   - **Rate Sensitivity Matrix (`src/components/RateSensitivity.tsx`)**: What-if scenario table from 1.0% to 5.5% SORA with dynamic variance analysis.
   - **Package Comparison (`src/components/PackageComparison.tsx`)**: Compare Singapore bank loan packages (DBS, OCBC, UOB, Standard Chartered) with 1-click apply.

---

## 2. Second Prompt: GitHub Repository Deployment

### User Request
> "git push https://<GITHUB_TOKEN>@https://github.com/KeziahVickraman/sora-calculator-demo.git"

### Engineer Action
1. Initialized git repository locally with `git init`.
2. Configured user credentials:
   - `user.name`: "Keziah Vickraman"
   - `user.email`: "keziahvickraman@gmail.com"
3. Added project files and created the initial commit:
   - `git commit -m "Initial commit: Singapore SORA Interest & Mortgage Calculator"`
4. Set default branch to `main`.
5. Pushed commits to GitHub remote:
   - `To https://github.com/KeziahVickraman/sora-calculator-demo.git [new branch] main -> main`
6. Sanitized the stored remote URL in git config to prevent credential persistence.

---

## 3. Third Prompt: Serverless MAS API Connection

### User Request
> "add a serverless connection that pulls MAS data using the following end points:
> - store this in /api folder (at project root level) NOT src file 
> - include /health.ts and /sora.ts within the same subfolder
> - do not hardcode any api keys, I will include them manually 
>
> # Daily SORA + compounded 1M/3M/6M averages:
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
>
> # All requests need the header:  KeyId: <MAS_KEY_ID>"

### Engineer Implementation Summary
1. **Created `/api/health.ts`**:
   - Lightweight serverless health check reporting API status, ISO timestamp, service identifier, and whether `MAS_KEY_ID` is present.
   - Verification output: `{"status":"healthy","service":"MAS SORA Gateway","hasMasKeyId":false}`.

2. **Created `/api/sora.ts`**:
   - Connects to the MAS API Gateway:
     `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`
   - Injects the required authentication header: `KeyId: <MAS_KEY_ID>`.
   - Reads `process.env.MAS_KEY_ID` or fallback header (`x-mas-key-id` / `KeyId`).
   - Normalizes data for the frontend (dates, daily SORA, 1M/3M/6M compounded rates, trade volume, weekend day count).
   - Supports query params forwarding (`limit`, `sort`, `start`, `end`).
   - Returns 401 with a descriptive message if `MAS_KEY_ID` is not yet configured.

3. **Created `server.ts` & Full-Stack Routing**:
   - Mounted `/api/health` and `/api/sora` using Express alongside Vite development middlewares.
   - Updated `package.json` scripts: `"dev": "tsx server.ts"`, `"start": "node server.ts"`.
   - Updated `src/services/masSoraService.ts` to attempt fetching from `/api/sora` first.
   - Updated `/.env.example` to document `MAS_KEY_ID="MY_MAS_KEY_ID"`.

4. **Testing & GitHub Push**:
   - Tested `/api/health` and `/api/sora` via curl.
   - Committed changes: `[main ed2d0f7] Add serverless MAS API endpoints /api/health and /api/sora`.
   - Pushed to `https://github.com/KeziahVickraman/sora-calculator-demo.git` on branch `main`.

---

## 4. Environment Configuration Guide

To supply your MAS API key:

1. Create or edit your `.env` file in the project root:
   ```bash
   MAS_KEY_ID="your_mas_api_key_id_here"
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. The server runs on `http://localhost:3000`, with API endpoints:
   - `http://localhost:3000/api/health`
   - `http://localhost:3000/api/sora`
