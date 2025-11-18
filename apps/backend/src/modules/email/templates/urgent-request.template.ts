export interface UrgentRequestTemplateData {
  machineName: string;
  companyName: string;
  branchName: string;
  requestedBy: string;
  requestedByEmail: string;
  notes?: string;
  machineUrl: string;
}

export function getUrgentRequestSubject(
  data: UrgentRequestTemplateData,
): string {
  return `🚨 Urgent Service Request - ${data.machineName}`;
}

export function getUrgentRequestHtml(data: UrgentRequestTemplateData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Urgent Service Request</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #ef4444;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      color: #ef4444;
      font-size: 24px;
    }
    .badge {
      display: inline-block;
      background-color: #ef4444;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .info-section {
      background-color: #f9fafb;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-item {
      margin: 8px 0;
    }
    .info-label {
      font-weight: 600;
      color: #1f2937;
      display: inline-block;
      min-width: 120px;
    }
    .notes {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
      font-style: italic;
    }
    .cta-button {
      display: inline-block;
      background-color: #3b82f6;
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #2563eb;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">URGENT</span>
      <h1>🚨 Service Request</h1>
    </div>

    <p>A client has requested an urgent service for one of their machines. Please review the details below and create a service record as soon as possible.</p>

    <div class="info-section">
      <div class="info-item">
        <span class="info-label">Machine:</span>
        <span>${data.machineName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Company:</span>
        <span>${data.companyName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Branch:</span>
        <span>${data.branchName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Requested by:</span>
        <span>${data.requestedBy} (${data.requestedByEmail})</span>
      </div>
    </div>

    ${
      data.notes
        ? `
    <div class="notes">
      <strong>Additional Notes:</strong><br>
      ${data.notes.replace(/\n/g, '<br>')}
    </div>
    `
        : ''
    }

    <div style="text-align: center;">
      <a href="${data.machineUrl}" class="cta-button">
        Create Service Record →
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      Clicking the button above will take you directly to the machine page where you can create a new service record.
    </p>

    <div class="footer">
      <p>This is an automated notification from Titans Tech Service Management System.</p>
      <p style="margin: 4px 0;">If you have any questions, please contact the client directly.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getUrgentRequestText(data: UrgentRequestTemplateData): string {
  return `
URGENT SERVICE REQUEST

A client has requested an urgent service for one of their machines.

Machine: ${data.machineName}
Company: ${data.companyName}
Branch: ${data.branchName}
Requested by: ${data.requestedBy} (${data.requestedByEmail})

${data.notes ? `Additional Notes:\n${data.notes}\n` : ''}

To create a service record, please visit:
${data.machineUrl}

---
This is an automated notification from Titans Tech Service Management System.
  `.trim();
}
