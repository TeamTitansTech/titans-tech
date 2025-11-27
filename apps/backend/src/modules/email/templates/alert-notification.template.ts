export interface AlertSection {
  sectionName: string;
  severity: 'YELLOW' | 'RED';
  alerts: Array<{
    fieldLabel: string;
    value: string;
  }>;
}

export interface AlertNotificationTemplateData {
  machineName: string;
  companyName: string;
  branchName: string;
  inspectionDate: string;
  performedBy: string;
  machineUrl: string;
  highestSeverity: 'YELLOW' | 'RED';
  sections: AlertSection[];
}

export function getAlertNotificationSubject(
  data: AlertNotificationTemplateData,
): string {
  const emoji = data.highestSeverity === 'RED' ? '🔴' : '🟡';
  const level = data.highestSeverity === 'RED' ? 'Critical' : 'Warning';
  return `${emoji} Inspection Alert (${level}) - ${data.machineName}`;
}

export function getAlertNotificationHtml(
  data: AlertNotificationTemplateData,
): string {
  const severityColor = data.highestSeverity === 'RED' ? '#ef4444' : '#f59e0b';
  const severityLabel = data.highestSeverity === 'RED' ? 'CRITICAL' : 'WARNING';

  const sectionsHtml = data.sections
    .map((section) => {
      const sectionColor = section.severity === 'RED' ? '#ef4444' : '#f59e0b';
      const alertsHtml = section.alerts
        .map(
          (alert) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${alert.fieldLabel}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${alert.value}</td>
        </tr>
      `,
        )
        .join('');

      return `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${sectionColor}; margin-right: 8px;"></span>
          <h3 style="margin: 0; color: #1f2937; font-size: 16px;">${section.sectionName}</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Field</th>
              <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Value</th>
            </tr>
          </thead>
          <tbody>
            ${alertsHtml}
          </tbody>
        </table>
      </div>
    `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inspection Alert</title>
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
      border-bottom: 3px solid ${severityColor};
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      color: ${severityColor};
      font-size: 24px;
    }
    .badge {
      display: inline-block;
      background-color: ${severityColor};
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
    .alerts-section {
      margin: 24px 0;
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
      <span class="badge">${severityLabel}</span>
      <h1>${data.highestSeverity === 'RED' ? '🔴' : '🟡'} Inspection Alert</h1>
    </div>

    <p>An inspection has been completed with alerts that require attention. Please review the details below.</p>

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
        <span class="info-label">Inspection Date:</span>
        <span>${data.inspectionDate}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Performed By:</span>
        <span>${data.performedBy}</span>
      </div>
    </div>

    <div class="alerts-section">
      <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px;">Alert Details</h2>
      ${sectionsHtml}
    </div>

    <div style="text-align: center;">
      <a href="${data.machineUrl}" class="cta-button">
        View Machine Details →
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      Clicking the button above will take you directly to the machine page where you can review the inspection details.
    </p>

    <div class="footer">
      <p>This is an automated notification from Titans Tech Service Management System.</p>
      <p style="margin: 4px 0;">If you have any questions, please contact the inspection team.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getAlertNotificationText(
  data: AlertNotificationTemplateData,
): string {
  const level = data.highestSeverity === 'RED' ? 'CRITICAL' : 'WARNING';

  const sectionsText = data.sections
    .map((section) => {
      const alertsText = section.alerts
        .map((alert) => `  - ${alert.fieldLabel}: ${alert.value}`)
        .join('\n');
      return `${section.sectionName} (${section.severity}):\n${alertsText}`;
    })
    .join('\n\n');

  return `
INSPECTION ALERT - ${level}

An inspection has been completed with alerts that require attention.

Machine: ${data.machineName}
Company: ${data.companyName}
Branch: ${data.branchName}
Inspection Date: ${data.inspectionDate}
Performed By: ${data.performedBy}

ALERT DETAILS:

${sectionsText}

To view the machine details, please visit:
${data.machineUrl}

---
This is an automated notification from Titans Tech Service Management System.
  `.trim();
}
