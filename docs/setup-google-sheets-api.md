**Set Up Google Sheets API Credentials**

1. **Enable Google Sheets API:**

   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.
   - Navigate to **APIs & Services** > **Library**.
   - Search for "Google Sheets API" and enable it.

2. **Create a Service Account:**

   - In the Cloud Console, go to **IAM & Admin** > **Service Accounts**.
   - Click **Create Service Account**.
   - Fill in the required details and click **Create**.
   - Skip assigning roles (unless needed) and click **Done**.

3. **Generate a JSON Key File:**

   - Click on your newly created service account.
   - Go to the **Keys** tab.
   - Click **Add Key** > **Create new key**.
   - Choose **JSON** and click **Create**. A JSON file will be downloaded.

4. **Share Your Google Sheet with the Service Account:**

   - Open your Google Sheet.
   - Click the **Share** button.
   - Add the service account's email (found in the JSON file under `client_email`).
   - Grant **Editor** access.

5. **Get Your Spreadsheet ID:**

   - Open your Google Sheet.
   - Look at the URL in your browser's address bar.
   - The Spreadsheet ID is the long string between `/d/` and `/edit`.
   - **Example:** In `https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7/edit#gid=0`, the Spreadsheet ID is `1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7`.

6. **Set Environment Variables:**

   **For Local Development:**

   - Copy the `.env.example` file to `.env.local`.
   - Add the following variables to `.env.local`:

     ```env
     SPREADSHEET_ID=your-spreadsheet-id
     GOOGLE_CLIENT_EMAIL=your-service-account-email
     GOOGLE_PRIVATE_KEY="your-private-key"
     WAITLIST_TIMEZONE=your-desired-timezone
     ```

     - Replace `your-spreadsheet-id` with the Spreadsheet ID you obtained.
     - Replace `your-service-account-email` with the `client_email` from your JSON key file.
     - Replace `your-private-key` with the `private_key` from your JSON key file. Ensure it's enclosed in double quotes and handle newline characters if present.
     - Replace `your-desired-timezone` with your preferred timezone (e.g., `UTC`, `America/New_York`).

   **For Production Deployment:**

   - Configure these environment variables in your deployment platform's settings (e.g., Vercel).
   - In Vercel: Go to **Project Settings** > **Environment Variables** and add each variable.
   - **Note:** Do not rely on `.env.local` for production deployments, as this file is not included in the build.

**Important Notes:**

- **Security:** Never commit your `.env.local` file or any credentials to version control.
- **Environment Variables:** Ensure that your environment variables are correctly set and accessible in your server-side code.