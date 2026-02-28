export type SupportedRetailer = "Walmart" | "Costco" | "Sams Club";

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

  if (normalizedFrom.includes("@samsclub.com")) {
    return { isReceipt: true, retailer: "Sams Club" };
  }

  // DEV ONLY: treat emails from your own address as Walmart receipts for testing
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_TEST_EMAIL &&
    normalizedFrom.includes(process.env.DEV_TEST_EMAIL.toLowerCase())
  ) {
    return { isReceipt: true, retailer: "Walmart" };
  }

  return { isReceipt: false, retailer: null };
};
