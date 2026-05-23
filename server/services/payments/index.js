import { createUpiPayment } from "./upiProvider.js";

const providers = {
  manual_upi: {
    createPayment: createUpiPayment
  }
};

export function createPaymentForOrder(method, details = {}) {
  const provider = providers[method];
  if (!provider) {
    const error = new Error("Unsupported payment method");
    error.status = 400;
    throw error;
  }
  return provider.createPayment(details);
}
