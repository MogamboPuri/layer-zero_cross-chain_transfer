export function addressToBytes32(addr) {
  if (!addr) return "0x0000000000000000000000000000000000000000000000000000000000000000";
  const cleaned = addr.replace(/^0x/i, "");
  const padded = cleaned.padStart(64, "0");
  return "0x" + padded;
}

