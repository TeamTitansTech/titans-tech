export interface PublicServiceRequestTemplateData {
  machineName: string;
  machineSerialNumber: string | null;
  companyName: string;
  branchName: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  problemDescription: string;
  imageUrl: string | null;
  machineUrl: string;
  deviceInfo: {
    ipAddress: string;
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
  };
}

export function getPublicServiceRequestSubject(
  data: PublicServiceRequestTemplateData,
): string {
  return `🔧 Public Maintenance Request - ${data.machineName}`;
}

export function getPublicServiceRequestHtml(
  data: PublicServiceRequestTemplateData,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Public Maintenance Request</title>
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
      border-bottom: 3px solid #f97316;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      color: #f97316;
      font-size: 24px;
    }
    .badge {
      display: inline-block;
      background-color: #f97316;
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
    .problem-section {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .problem-section h3 {
      margin: 0 0 12px 0;
      color: #92400e;
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
    .qr-note {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 12px;
      font-size: 13px;
      color: #1e40af;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">QR CODE REQUEST</span>
      <h1>🔧 Maintenance Request</h1>
    </div>

    <p>A maintenance request has been submitted via QR code scan. Please review the details below and take appropriate action.</p>

    <div class="info-section">
      <h3 style="margin: 0 0 12px 0; color: #1e40af;">Machine Information</h3>
      <div class="info-item">
        <span class="info-label">Machine:</span>
        <span>${data.machineName}</span>
      </div>
      ${
        data.machineSerialNumber
          ? `
      <div class="info-item">
        <span class="info-label">Serial Number:</span>
        <span>${data.machineSerialNumber}</span>
      </div>
      `
          : ''
      }
      <div class="info-item">
        <span class="info-label">Company:</span>
        <span>${data.companyName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Branch:</span>
        <span>${data.branchName}</span>
      </div>
    </div>

    <div class="info-section" style="border-left-color: #10b981;">
      <h3 style="margin: 0 0 12px 0; color: #065f46;">Requester Information</h3>
      <div class="info-item">
        <span class="info-label">Name:</span>
        <span>${data.requesterName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email:</span>
        <span><a href="mailto:${data.requesterEmail}">${data.requesterEmail}</a></span>
      </div>
      ${
        data.requesterPhone
          ? `
      <div class="info-item">
        <span class="info-label">Phone:</span>
        <span><a href="tel:${data.requesterPhone}">${data.requesterPhone}</a></span>
      </div>
      `
          : ''
      }
    </div>

    <div class="problem-section">
      <h3>Problem Description:</h3>
      <p style="margin: 0; white-space: pre-wrap;">${data.problemDescription.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>

    ${
      data.imageUrl
        ? `
    <div class="info-section" style="border-left-color: #8b5cf6;">
      <h3 style="margin: 0 0 12px 0; color: #6d28d9;">Attached Photo</h3>
      <div style="text-align: center;">
        <img src="${data.imageUrl}" alt="Problem photo" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid #e5e7eb;" />
      </div>
    </div>
    `
        : ''
    }

    <div style="text-align: center;">
      <a href="${data.machineUrl}" class="cta-button">
        View Machine Details →
      </a>
    </div>

    <div class="info-section" style="border-left-color: #6b7280; background-color: #f3f4f6;">
      <h3 style="margin: 0 0 12px 0; color: #374151;">Device Information</h3>
      <div class="info-item">
        <span class="info-label">IP Address:</span>
        <span>${data.deviceInfo.ipAddress}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Browser:</span>
        <span>${data.deviceInfo.browser}</span>
      </div>
      <div class="info-item">
        <span class="info-label">OS:</span>
        <span>${data.deviceInfo.os}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Device:</span>
        <span>${data.deviceInfo.device} ${data.deviceInfo.isMobile ? '(Mobile)' : '(Desktop)'}</span>
      </div>
    </div>

    <div class="qr-note">
      <strong>Note:</strong> This request was submitted by an unauthenticated user who scanned the machine's QR code.
    </div>

    <div class="footer">
      <p>This is an automated notification from Titans Tech Service Management System.</p>
      <p style="margin: 4px 0;">Please review and assign this maintenance request to the appropriate technician.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getPublicServiceRequestText(
  data: PublicServiceRequestTemplateData,
): string {
  return `
PUBLIC MAINTENANCE REQUEST (via QR Code)

A maintenance request has been submitted via QR code scan.

=== MACHINE INFORMATION ===
Machine: ${data.machineName}
${data.machineSerialNumber ? `Serial Number: ${data.machineSerialNumber}\n` : ''}Company: ${data.companyName}
Branch: ${data.branchName}

=== REQUESTER INFORMATION ===
Name: ${data.requesterName}
Email: ${data.requesterEmail}
${data.requesterPhone ? `Phone: ${data.requesterPhone}\n` : ''}
=== PROBLEM DESCRIPTION ===
${data.problemDescription}
${data.imageUrl ? `\n=== ATTACHED PHOTO ===\n${data.imageUrl}\n` : ''}
=== DEVICE INFORMATION ===
IP Address: ${data.deviceInfo.ipAddress}
Browser: ${data.deviceInfo.browser}
OS: ${data.deviceInfo.os}
Device: ${data.deviceInfo.device} (${data.deviceInfo.isMobile ? 'Mobile' : 'Desktop'})

---

To view machine details, please visit:
${data.machineUrl}

Note: This request was submitted by an unauthenticated user who scanned the machine's QR code.

---
This is an automated notification from Titans Tech Service Management System.
  `.trim();
}
