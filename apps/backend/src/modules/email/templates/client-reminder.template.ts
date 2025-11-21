export interface ClientReminderTemplateData {
  userName: string;
  machineName: string;
  branchName: string;
  lastServiceDate?: string;
  daysOverdue?: number;
  machineUrl: string;
}

export function getClientReminderSubject(
  data: ClientReminderTemplateData,
): string {
  if (data.daysOverdue && data.daysOverdue > 0) {
    return `⚠️ Service Overdue - ${data.machineName}`;
  }
  return `🔔 Service Reminder - ${data.machineName}`;
}

export function getClientReminderHtml(
  data: ClientReminderTemplateData,
): string {
  const isOverdue = data.daysOverdue && data.daysOverdue > 0;
  const badgeColor = isOverdue ? '#ef4444' : '#f59e0b';
  const badgeText = isOverdue ? 'OVERDUE' : 'REMINDER';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Reminder</title>
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
      border-bottom: 3px solid ${badgeColor};
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      color: #1f2937;
      font-size: 24px;
    }
    .badge {
      display: inline-block;
      background-color: ${badgeColor};
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
      min-width: 140px;
    }
    .warning {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
      color: #991b1b;
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
      <span class="badge">${badgeText}</span>
      <h1>${isOverdue ? '⚠️' : '🔔'} Machine Service ${isOverdue ? 'Overdue' : 'Reminder'}</h1>
    </div>

    <p>Hello ${data.userName},</p>

    <p>${
      isOverdue
        ? `Your machine <strong>${data.machineName}</strong> has a service that is overdue by <strong>${data.daysOverdue} days</strong>. Please schedule a service as soon as possible to ensure optimal performance.`
        : `This is a friendly reminder that your machine <strong>${data.machineName}</strong> is due for service.`
    }</p>

    <div class="info-section">
      <div class="info-item">
        <span class="info-label">Machine:</span>
        <span>${data.machineName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Branch:</span>
        <span>${data.branchName}</span>
      </div>
      ${
        data.lastServiceDate
          ? `
      <div class="info-item">
        <span class="info-label">Last Service:</span>
        <span>${data.lastServiceDate}</span>
      </div>
      `
          : ''
      }
    </div>

    ${
      isOverdue
        ? `
    <div class="warning">
      <strong>⚠️ Action Required</strong><br>
      This machine requires immediate attention. Delayed servicing may lead to decreased performance or potential equipment damage.
    </div>
    `
        : ''
    }

    <div style="text-align: center;">
      <a href="${data.machineUrl}" class="cta-button">
        View Machine Details →
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      Clicking the button above will take you to the machine page where you can view service history and details.
    </p>

    <div class="footer">
      <p>This is an automated reminder from Titans Tech Service Management System.</p>
      <p style="margin: 4px 0;">Regular maintenance helps ensure your equipment operates at peak efficiency.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getClientReminderText(
  data: ClientReminderTemplateData,
): string {
  const isOverdue = data.daysOverdue && data.daysOverdue > 0;

  return `
${isOverdue ? 'SERVICE OVERDUE' : 'SERVICE REMINDER'}

Hello ${data.userName},

${
  isOverdue
    ? `Your machine "${data.machineName}" has a service that is overdue by ${data.daysOverdue} days. Please schedule a service as soon as possible.`
    : `This is a friendly reminder that your machine "${data.machineName}" is due for service.`
}

Machine: ${data.machineName}
Branch: ${data.branchName}
${data.lastServiceDate ? `Last Service: ${data.lastServiceDate}` : ''}

To view machine details and service history, please visit:
${data.machineUrl}

---
This is an automated reminder from Titans Tech Service Management System.
Regular maintenance helps ensure your equipment operates at peak efficiency.
  `.trim();
}
