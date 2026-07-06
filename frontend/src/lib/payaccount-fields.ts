/**
 * Ordered param1..param8 field labels per gateway, matching the legacy
 * switch-statement mapping in Admin\Payment\PayaccountContorller@store.
 */
export const PAYACCOUNT_FIELDS: Record<string, { name: string; label: string; secret?: boolean }[]> = {
  bank: [
    { name: "account_name", label: "Account Name" },
    { name: "account_number", label: "Account Number" },
    { name: "bank_name", label: "Bank Name" },
    { name: "branch_address", label: "Branch Address" },
    { name: "ifsc_code", label: "IFSC Code" },
    { name: "branch_name", label: "Branch Name" },
  ],
  gpay: [{ name: "gpay_number", label: "GPay Number" }],
  upi: [{ name: "upi_id", label: "UPI ID" }],
  cheque: [{ name: "payee_name", label: "Payee Name" }],
  paystack: [
    { name: "public_key", label: "Public Key" },
    { name: "secret_key", label: "Secret Key", secret: true },
  ],
  flutterwave: [
    { name: "public_key", label: "Public Key" },
    { name: "secret_key", label: "Secret Key", secret: true },
    { name: "encryption_key", label: "Encryption Key", secret: true },
  ],
  mpesa: [
    { name: "consumer_key", label: "Consumer Key" },
    { name: "consumer_secret", label: "Consumer Secret", secret: true },
    { name: "shortcode", label: "Shortcode" },
    { name: "passkey", label: "Passkey", secret: true },
  ],
  gcash: [
    { name: "public_key", label: "Public Key" },
    { name: "secret_key", label: "Secret Key", secret: true },
  ],
  pix: [{ name: "pix_key", label: "Pix Key" }],
  telebirr: [
    { name: "app_id", label: "App ID" },
    { name: "app_key", label: "App Key", secret: true },
    { name: "public_key", label: "Public Key" },
    { name: "short_code", label: "Short Code" },
  ],
  stripe: [
    { name: "public_key", label: "Publishable Key" },
    { name: "secret_key", label: "Secret Key", secret: true },
    { name: "webhook_secret", label: "Webhook Secret", secret: true },
    { name: "_unused", label: "" },
    { name: "currency", label: "Currency" },
  ],
  cash: [],
};
