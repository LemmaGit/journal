import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { Trade } from "../types";
import { calculateStats, getWeekId } from "./helpers";

// Utility to convert Base64 Data URL to Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const exportWeeklyReport = async (trades: Trade[], weekStartDate: string) => {
  const weekId = getWeekId(weekStartDate);
  const weekTrades = trades.filter((t) => getWeekId(t.date) === weekId);
  const stats = calculateStats(weekTrades);

  // Styling helpers
  const tableCellPadding = { top: 100, bottom: 100, left: 150, right: 150 };
  const borderNone = { style: BorderStyle.NONE, size: 0, color: "auto" };
  const borderLight = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };

  const cellBorders = {
    top: borderLight,
    bottom: borderLight,
    left: borderNone,
    right: borderNone,
  };

  // 1. Cover / Title Section
  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 400 },
    children: [
      new TextRun({
        text: "WEEKLY PERFORMANCE REPORT",
        bold: true,
        size: 32,
        color: "4F46E5", // Indigo
        font: "Arial",
      }),
    ],
  });

  const subtitleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [
      new TextRun({
        text: `Week of: ${weekId} to ${new Date(new Date(weekId).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`,
        size: 24,
        color: "4B5563",
        font: "Arial",
        italics: true,
      }),
    ],
  });

  // 2. Statistics Table
  const statsTitle = new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text: "Weekly Summary Statistics",
        bold: true,
        size: 24,
        color: "1F2937",
        font: "Arial",
      }),
    ],
  });

  const statsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            shading: { fill: "F3F4F6" },
            margins: tableCellPadding,
            children: [new Paragraph({ children: [new TextRun({ text: "Metric", bold: true, color: "374151" })] })],
          }),
          new TableCell({
            shading: { fill: "F3F4F6" },
            margins: tableCellPadding,
            children: [new Paragraph({ children: [new TextRun({ text: "Value", bold: true, color: "374151" })] })],
          }),
        ],
      }),
      // Rows
      new TableRow({
        children: [
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph("Total Trades")] }),
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(stats.total.toString())] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph("Win Rate")] }),
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(`${stats.winRate.toFixed(2)}%`)] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph("Net Profit / Loss")] }),
          new TableCell({
            margins: tableCellPadding,
            borders: cellBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: stats.netProfit >= 0 ? `+$${stats.netProfit.toFixed(2)}` : `-$${Math.abs(stats.netProfit).toFixed(2)}`,
                    bold: true,
                    color: stats.netProfit >= 0 ? "10B981" : "EF4444",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph("Profit Factor")] }),
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(stats.profitFactor === Infinity ? "Infinity" : stats.profitFactor.toFixed(2))] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph("Average Risk : Reward")] }),
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(`1 : ${stats.avgRR.toFixed(2)}`)] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph("Daily stop rules hit?")] }),
          new TableCell({
            margins: tableCellPadding,
            borders: cellBorders,
            children: [new Paragraph(weekTrades.some((t) => t.result === "Loss" || t.result === "Win") ? "Yes (Enforced)" : "No")],
          }),
        ],
      }),
    ],
  });

  // 3. Trade Breakdown Table
  const breakdownTitle = new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text: "Daily Trade Breakdown",
        bold: true,
        size: 24,
        color: "1F2937",
        font: "Arial",
      }),
    ],
  });

  const breakdownRows = [
    // Header
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ shading: { fill: "F3F4F6" }, margins: tableCellPadding, children: [new Paragraph({ children: [new TextRun({ text: "Date", bold: true })] })] }),
        new TableCell({ shading: { fill: "F3F4F6" }, margins: tableCellPadding, children: [new Paragraph({ children: [new TextRun({ text: "Pair", bold: true })] })] }),
        new TableCell({ shading: { fill: "F3F4F6" }, margins: tableCellPadding, children: [new Paragraph({ children: [new TextRun({ text: "Dir", bold: true })] })] }),
        new TableCell({ shading: { fill: "F3F4F6" }, margins: tableCellPadding, children: [new Paragraph({ children: [new TextRun({ text: "Result", bold: true })] })] }),
        new TableCell({ shading: { fill: "F3F4F6" }, margins: tableCellPadding, children: [new Paragraph({ children: [new TextRun({ text: "Risk", bold: true })] })] }),
        new TableCell({ shading: { fill: "F3F4F6" }, margins: tableCellPadding, children: [new Paragraph({ children: [new TextRun({ text: "R:R", bold: true })] })] }),
        new TableCell({ shading: { fill: "F3F4F6" }, margins: tableCellPadding, children: [new Paragraph({ children: [new TextRun({ text: "PnL", bold: true })] })] }),
        new TableCell({ shading: { fill: "F3F4F6" }, margins: tableCellPadding, children: [new Paragraph({ children: [new TextRun({ text: "Notes", bold: true })] })] }),
      ],
    }),
  ];

  weekTrades.forEach((t) => {
    const pnlVal = t.result === "Win" ? t.risk * t.rr : t.result === "Loss" ? -t.risk : 0;
    breakdownRows.push(
      new TableRow({
        children: [
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(t.date)] }),
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(t.pair)] }),
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(t.direction)] }),
          new TableCell({
            margins: tableCellPadding,
            borders: cellBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: t.result,
                    bold: true,
                    color: t.result === "Win" ? "10B981" : t.result === "Loss" ? "EF4444" : "F59E0B",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(`$${t.risk}`)] }),
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(`${t.rr}R`)] }),
          new TableCell({
            margins: tableCellPadding,
            borders: cellBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: pnlVal >= 0 ? `+$${pnlVal.toFixed(0)}` : `-$${Math.abs(pnlVal).toFixed(0)}`,
                    color: pnlVal >= 0 ? "10B981" : "EF4444",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({ margins: tableCellPadding, borders: cellBorders, children: [new Paragraph(t.notes || "-")] }),
        ],
      })
    );
  });

  const breakdownTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: breakdownRows,
  });

  // 4. Screenshots and Psychology Details Section
  const detailsChildren: any[] = [];
  const screenshotTrades = weekTrades.filter((t) => t.screenshots && t.screenshots.length > 0);

  if (screenshotTrades.length > 0) {
    detailsChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 600, after: 200 },
        children: [
          new TextRun({
            text: "Trade Screenshot Attachments & Psychology",
            bold: true,
            size: 24,
            color: "1F2937",
            font: "Arial",
          }),
        ],
      })
    );

    for (let index = 0; index < screenshotTrades.length; index++) {
      const t = screenshotTrades[index];
      detailsChildren.push(
        new Paragraph({
          spacing: { before: 300, after: 100 },
          children: [
            new TextRun({
              text: `Trade ID: ${t.id} - ${t.date} [${t.pair} ${t.direction}] - Result: ${t.result}`,
              bold: true,
              size: 16,
              color: "4F46E5",
            }),
          ],
        })
      );

      if (t.psychNotes || (t.psychTags && t.psychTags.length > 0)) {
        detailsChildren.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Psychology Tags: ", bold: true, size: 12 }),
              new TextRun({ text: (t.psychTags || []).join(", ") || "None", size: 12, italics: true }),
            ],
          })
        );
        detailsChildren.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "Psychology Notes: ", bold: true, size: 12 }),
              new TextRun({ text: t.psychNotes || "No notes logged", size: 12 }),
            ],
          })
        );
      }

      // Convert Base64 screenshot to ImageRun
      try {
        const imageBuffer = base64ToUint8Array(t.screenshots[0]);
        detailsChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 500,
                  height: 300,
                },
              } as any),
            ],
          })
        );
      } catch (err) {
        console.error("Error inserting screenshot in DOCX: ", err);
        detailsChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: "[Error: Could not render image attachment]", color: "EF4444", italics: true }),
            ],
          })
        );
      }
    }
  }

  // Compile the final document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          titleParagraph,
          subtitleParagraph,
          statsTitle,
          statsTable,
          breakdownTitle,
          breakdownTable,
          ...detailsChildren,
        ],
      },
    ],
  });

  // Pack document and download
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Trading_Journal_Report_Week_${weekId}.docx`);
};
