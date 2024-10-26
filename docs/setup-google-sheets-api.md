1. **Set Up Google Sheets API Credentials**

   - **Enable Google Sheets API:**
     - Go to the [Google Cloud Console](https://console.cloud.google.com/).
     - Create a new project or select an existing one.
     - Navigate to **APIs & Services** > **Library**.
     - Search for "Google Sheets API" and enable it.

   - **Create a Service Account:**
     - In the Cloud Console, go to **IAM & Admin** > **Service Accounts**.
     - Click **Create Service Account**.
     - Fill in the required details and click **Create**.
     - Skip assigning roles (unless needed) and click **Done**.

   - **Generate a JSON Key File:**
     - Click on your newly created service account.
     - Go to the **Keys** tab.
     - Click **Add Key** > **Create new key**.
     - Choose **JSON** and click **Create**. A JSON file will be downloaded.

   - **Share Your Google Sheet with the Service Account:**
     - Open your Google Sheet.
     - Click the **Share** button.
     - Add the service account's email (found in the JSON file under `client_email`).
     - Grant **Editor** access.

2. **Store Credentials Securely**

   - **Create a `.env.local` File:**

     ```env
     GOOGLE_CLIENT_EMAIL=your-service-account-email
     GOOGLE_PRIVATE_KEY="your-private-key"
     SPREADSHEET_ID=your-spreadsheet-id
     ```

     - **Note:** Replace `your-service-account-email` with the `client_email` from your JSON file.
     - Replace `your-private-key` with the `private_key` from your JSON file. Ensure you wrap it in double quotes and handle newline characters.
     - Replace `your-spreadsheet-id` with your Google Sheet ID (found in the URL).

   - **For Production Deployment:**
     - When deploying to platforms like Vercel, you'll need to configure these environment variables in your deployment platform's settings.
     - In Vercel: Go to Project Settings > Environment Variables and add each variable.
     - Do not rely on `.env.local` for production deployments as this file is not included in the build.

**Important Notes:**

- **Security:** Never commit your `.env.local` file or any credentials to version control.
- **Environment Variables:** Ensure that your environment variables are correctly set and accessible in your server-side code.
