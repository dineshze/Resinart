const defaultUpiId = process.env.UPI_ID || "example@upi";
const defaultMerchantName = process.env.UPI_MERCHANT_NAME || "HappyCreation";

export function createUpiPayment({ amount, note, orderRef }) {
  return {
    method: "manual_upi",
    status: "screenshot_uploaded",
    metadata: {
      upiId: defaultUpiId,
      merchantName: defaultMerchantName,
      amount,
      note,
      orderRef
    }
  };
}
