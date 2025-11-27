export interface AlertMeasurement {
  name: string;
  differential: string;
  status: 'YELLOW' | 'RED';
}

export interface AlertSubsection {
  name: string;
  severity: 'YELLOW' | 'RED';
  measurements: AlertMeasurement[];
}

export interface AlertSection {
  sectionName: string;
  severity: 'YELLOW' | 'RED';
  subsections?: AlertSubsection[];
  // Legacy format for sections without subsections
  alerts?: Array<{
    fieldLabel: string;
    value: string;
    status?: 'YELLOW' | 'RED';
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
  const level = data.highestSeverity === 'RED' ? 'Crítico' : 'Atenção';
  return `${emoji} Alerta de Inspeção (${level}) - ${data.machineName}`;
}

export function getAlertNotificationHtml(
  data: AlertNotificationTemplateData,
): string {
  const severityColor = data.highestSeverity === 'RED' ? '#ef4444' : '#f59e0b';
  const severityLabel = data.highestSeverity === 'RED' ? 'CRÍTICO' : 'ATENÇÃO';

  const getStatusBadge = (status: 'YELLOW' | 'RED') => {
    const color = status === 'RED' ? '#ef4444' : '#f59e0b';
    const label = status === 'RED' ? 'Crítico' : 'Atenção';
    return `<span style="display: inline-block; background-color: ${color}; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">${label}</span>`;
  };

  const sectionsHtml = data.sections
    .map((section) => {
      // Handle sections with subsections (like Bearing Clearance with Outer/Inner)
      if (section.subsections && section.subsections.length > 0) {
        const subsectionsHtml = section.subsections
          .map((subsection) => {
            const measurementsHtml = subsection.measurements
              .map(
                (m) => `
              <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${m.name}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600;">${m.differential}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${getStatusBadge(m.status)}</td>
              </tr>
            `,
              )
              .join('');

            return `
            <div style="margin-bottom: 16px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #f9fafb; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #1f2937;">${subsection.name}</span>
                ${getStatusBadge(subsection.severity)}
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px 12px; text-align: left; font-weight: 500; color: #6b7280; font-size: 13px;">Medição</th>
                    <th style="padding: 10px 12px; text-align: center; font-weight: 500; color: #6b7280; font-size: 13px;">Diferencial</th>
                    <th style="padding: 10px 12px; text-align: center; font-weight: 500; color: #6b7280; font-size: 13px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${measurementsHtml}
                </tbody>
              </table>
            </div>
          `;
          })
          .join('');

        return `
        <div style="margin-bottom: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${section.sectionName}</h3>
            ${getStatusBadge(section.severity)}
          </div>
          <div style="padding: 16px;">
            ${subsectionsHtml}
          </div>
        </div>
      `;
      }

      // Handle sections with alerts (legacy format or simple sections)
      const alertsHtml = (section.alerts || [])
        .map(
          (alert) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${alert.fieldLabel}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600;">${alert.value}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${getStatusBadge(alert.status || section.severity)}</td>
        </tr>
      `,
        )
        .join('');

      return `
      <div style="margin-bottom: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${section.sectionName}</h3>
          ${getStatusBadge(section.severity)}
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px 12px; text-align: left; font-weight: 500; color: #6b7280; font-size: 13px;">Medição</th>
              <th style="padding: 10px 12px; text-align: center; font-weight: 500; color: #6b7280; font-size: 13px;">Valor</th>
              <th style="padding: 10px 12px; text-align: center; font-weight: 500; color: #6b7280; font-size: 13px;">Status</th>
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
      <h1>${data.highestSeverity === 'RED' ? '🔴' : '🟡'} Alerta de Inspeção</h1>
    </div>

    <p>Uma inspeção foi concluída com alertas que requerem atenção. Por favor, revise os detalhes abaixo.</p>

    <div class="info-section">
      <div class="info-item">
        <span class="info-label">Máquina:</span>
        <span>${data.machineName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Empresa:</span>
        <span>${data.companyName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Filial:</span>
        <span>${data.branchName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Data da Inspeção:</span>
        <span>${data.inspectionDate}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Realizada por:</span>
        <span>${data.performedBy}</span>
      </div>
    </div>

    <div class="alerts-section">
      <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px;">Detalhes dos Alertas</h2>
      ${sectionsHtml}
    </div>

    <div style="text-align: center;">
      <a href="${data.machineUrl}" class="cta-button">
        Ver Detalhes da Máquina →
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      Clicando no botão acima você será direcionado para a página da máquina onde pode revisar os detalhes da inspeção.
    </p>

    <div class="footer">
      <p>Esta é uma notificação automática do Sistema de Gerenciamento de Serviços Titans Tech.</p>
      <p style="margin: 4px 0;">Se você tiver alguma dúvida, entre em contato com a equipe de inspeção.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getAlertNotificationText(
  data: AlertNotificationTemplateData,
): string {
  const level = data.highestSeverity === 'RED' ? 'CRÍTICO' : 'ATENÇÃO';

  const sectionsText = data.sections
    .map((section) => {
      // Handle sections with subsections
      if (section.subsections && section.subsections.length > 0) {
        const subsectionsText = section.subsections
          .map((subsection) => {
            const measurementsText = subsection.measurements
              .map(
                (m) =>
                  `    - ${m.name}: ${m.differential} (${m.status === 'RED' ? 'Crítico' : 'Atenção'})`,
              )
              .join('\n');
            return `  ${subsection.name} (${subsection.severity === 'RED' ? 'Crítico' : 'Atenção'}):\n${measurementsText}`;
          })
          .join('\n\n');
        return `${section.sectionName} (${section.severity === 'RED' ? 'Crítico' : 'Atenção'}):\n${subsectionsText}`;
      }

      // Handle sections with alerts
      const alertsText = (section.alerts || [])
        .map(
          (alert) =>
            `  - ${alert.fieldLabel}: ${alert.value} (${(alert.status || section.severity) === 'RED' ? 'Crítico' : 'Atenção'})`,
        )
        .join('\n');
      return `${section.sectionName} (${section.severity === 'RED' ? 'Crítico' : 'Atenção'}):\n${alertsText}`;
    })
    .join('\n\n');

  return `
ALERTA DE INSPEÇÃO - ${level}

Uma inspeção foi concluída com alertas que requerem atenção. Por favor, revise os detalhes abaixo.

Máquina: ${data.machineName}
Empresa: ${data.companyName}
Filial: ${data.branchName}
Data da Inspeção: ${data.inspectionDate}
Realizada por: ${data.performedBy}

DETALHES DOS ALERTAS:

${sectionsText}

Para ver os detalhes da máquina, visite:
${data.machineUrl}

---
Esta é uma notificação automática do Sistema de Gerenciamento de Serviços Titans Tech.
  `.trim();
}
