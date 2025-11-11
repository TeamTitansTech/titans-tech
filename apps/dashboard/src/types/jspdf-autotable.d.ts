import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  type CellStyles = {
    cellPadding?: number;
    fontSize?: number;
    font?: string;
    lineColor?: number | [number, number, number];
    lineWidth?: number;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    fillColor?: number | [number, number, number] | false;
    textColor?: number | [number, number, number];
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    cellWidth?: 'auto' | 'wrap' | number;
    minCellHeight?: number;
    minCellWidth?: number;
  };

  interface AutoTableOptions {
    startY?: number;
    head?: (string | number)[][];
    body?: (string | number)[][];
    foot?: (string | number)[][];
    theme?: 'striped' | 'grid' | 'plain';
    styles?: CellStyles;
    headStyles?: CellStyles;
    bodyStyles?: CellStyles;
    footStyles?: CellStyles;
    alternateRowStyles?: CellStyles;
    columnStyles?: Record<string | number, CellStyles>;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    horizontalPageBreak?: boolean;
    horizontalPageBreakRepeat?: number | number[];
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
