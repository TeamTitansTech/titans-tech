/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    theme?: 'striped' | 'grid' | 'plain';
    styles?: any;
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
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

  global {
    interface jsPDF {
      lastAutoTable: {
        finalY: number;
      };
    }
  }
}
