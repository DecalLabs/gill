/**
 * Converts a UI amount (human-readable) to raw amount (BigInt)
 * @param uiAmount The human-readable token amount (e.g., 1.5)
 * @param decimals The number of decimals for the token
 * @returns BigInt representation of the amount
 */
export function tokenUiAmountToAmount(uiAmount: number, decimals: number): bigint {
  // Handle potential scientific notation by using the built-in toFixed
  // This ensures we get a decimal string representation without scientific notation
  const uiAmountStr = uiAmount.toFixed(decimals);

  // Find decimal point position
  const decimalPointIndex = uiAmountStr.indexOf(".");

  let wholeNumber: string;
  let fractionalPart: string;

  if (decimalPointIndex === -1) {
    // No decimal point
    wholeNumber = uiAmountStr;
    fractionalPart = "";
  } else {
    wholeNumber = uiAmountStr.substring(0, decimalPointIndex);
    fractionalPart = uiAmountStr.substring(decimalPointIndex + 1);
  }

  // Pad or truncate fractional part based on decimals
  if (fractionalPart.length > decimals) {
    fractionalPart = fractionalPart.substring(0, decimals);
  } else {
    fractionalPart = fractionalPart.padEnd(decimals, "0");
  }

  // Combine and convert to BigInt, stripping any potential leading zeros
  const rawAmountStr = wholeNumber + fractionalPart;
  if (rawAmountStr.replace(/0/g, "") === "") {
    return BigInt(0);
  }
  return BigInt(rawAmountStr);
}

/**
 * Converts a raw amount (BigInt) to UI amount (human-readable)
 *
 * Note: This function does not support token balances that utilize the various "UI amount modifying"
 * Token Extensions, like the Interest-Bearing extension.
 *
 * @param amount The raw token amount as BigInt
 * @param decimals The number of decimals for the token
 * @returns UI representation of the amount as a number
 */
export function tokenAmountToUiAmount(amount: bigint, decimals: number): number {
  // Convert to string for easier manipulation
  let amountStr = amount.toString();

  // Pad with leading zeros if necessary
  if (amountStr.length <= decimals) {
    amountStr = amountStr.padStart(decimals + 1, "0");
  }

  // Split into whole and fractional parts
  const wholePartLength = amountStr.length - decimals;
  const wholePart = amountStr.substring(0, wholePartLength);
  const fractionalPart = amountStr.substring(wholePartLength);

  // Combine with decimal point
  const uiAmountStr = `${wholePart || "0"}.${fractionalPart}`;

  // Convert back to number
  return parseFloat(uiAmountStr);
}
