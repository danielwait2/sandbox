import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type ExportRow = {
  transaction_date: string;
  retailer: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  subcategory: string | null;
};

function escapeCsv(value: string | number | null): string {
  const str = value === null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;

  const rows = db
    .prepare(
      `SELECT r.transaction_date, r.retailer, li.name, li.quantity,
              li.unit_price, li.total_price, li.category, li.subcategory
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE r.user_id = ?
       ORDER BY r.transaction_date DESC`
    )
    .all(userId) as ExportRow[];

  const header = 'date,retailer,item_name,quantity,unit_price,total_price,category,subcategory';
  const lines = rows.map((row) =>
    [
      escapeCsv(row.transaction_date),
      escapeCsv(row.retailer),
      escapeCsv(row.name),
      escapeCsv(row.quantity),
      escapeCsv(row.unit_price),
      escapeCsv(row.total_price),
      escapeCsv(row.category),
      escapeCsv(row.subcategory),
    ].join(',')
  );

  const csv = [header, ...lines].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="runway-export.csv"',
    },
  });
}
