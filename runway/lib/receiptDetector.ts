export type SupportedRetailer = "Walmart" | "Costco";

export type ReceiptDetectionResult = {
  isReceipt: boolean;
  retailer: SupportedRetailer | null;
};

export const isReceiptEmail = (from: string): ReceiptDetectionResult => {
  const normalizedFrom = from.toLowerCase();

  if (normalizedFrom.includes("@walmart.com")) {
    return { isReceipt: true, retailer: "Walmart" };
  }

  if (normalizedFrom.includes("@costco.com")) {
    return { isReceipt: true, retailer: "Costco" };
  }

  return { isReceipt: false, retailer: null };
};
