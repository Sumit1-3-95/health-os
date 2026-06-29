# Health OS — Apple Shortcut Setup

## What this does
Reads your Apple Watch data (steps, calories, exercise, heart rate, sleep) and sends it to your Health OS dashboard automatically.

## Setup (one time, 5 minutes)

### Step 1 — Create the Shortcut on your iPhone

1. Open the **Shortcuts** app on your iPhone
2. Tap **+** to create a new shortcut
3. Tap **Add Action**
4. Search **"Health"** → select **Find Health Samples**

Add these 6 actions (one per metric):

---

**Action 1 — Steps**
- Type: Steps
- Sort by: Start Date, descending  
- Limit: 1 sample
- Save result as variable: `steps_count`

**Action 2 — Active Energy**
- Type: Active Energy Burned
- Sort by: Start Date, descending
- Limit: 1 sample  
- Save result as variable: `active_cals`

**Action 3 — Exercise Time**
- Type: Exercise Time
- Sort by: Start Date, descending
- Limit: 1 sample
- Save result as variable: `ex_mins`

**Action 4 — Resting Heart Rate**
- Type: Resting Heart Rate
- Sort by: Start Date, descending
- Limit: 1 sample
- Save result as variable: `hr`

**Action 5 — Sleep Analysis**
- Type: Sleep Analysis
- Sort by: Start Date, descending
- Limit: 1 sample
- Save result as variable: `sleep`

**Action 6 — Get Current Date**
- Format: ISO 8601 (YYYY-MM-DD only — set custom format to "yyyy-MM-dd")
- Save result as variable: `today_date`

---

**Action 7 — Get Contents of URL (POST request)**
- URL: `https://YOUR-VERCEL-URL.vercel.app/api/health-metrics`
- Method: POST
- Headers: `Content-Type: application/json`
- Request Body (JSON):

```json
{
  "date": "[today_date]",
  "steps": "[steps_count]",
  "active_calories": "[active_cals]",
  "exercise_minutes": "[ex_mins]",
  "resting_heart_rate": "[hr]",
  "sleep_hours": "[sleep]"
}
```

Replace `[variable_name]` with the actual Shortcuts variables.
Replace `YOUR-VERCEL-URL` with your actual Vercel URL.

---

### Step 2 — Name the shortcut
Name it **"Health OS Sync"**

### Step 3 — Add to home screen
Long press the shortcut → Share → Add to Home Screen

### Step 4 — Automate it (optional)
Shortcuts → Automation → Create Personal Automation → Time of Day → 10:00 PM → Run Shortcut → Health OS Sync → Don't Ask Before Running

---

## Testing
1. Run the shortcut manually first
2. Check your Health OS Dashboard tab — data should appear within seconds
3. Check Supabase Table Editor → health_metrics table for the row

## Troubleshooting
- **Permission denied**: Go to Settings → Privacy → Health → Shortcuts → enable all read permissions
- **No data**: Make sure your Apple Watch synced to iPhone Health app first (open Health app and check)
- **Wrong date**: Make sure date format is exactly `yyyy-MM-dd`
