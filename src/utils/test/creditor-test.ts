function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return Array.from(
    { length },
    () => characters[Math.floor(Math.random() * characters.length)],
  ).join('');
}

function generateRandomNumericString(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function generateRandomDate(): string {
  const start = new Date(2000, 0, 1);
  const end = new Date();
  const randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  return randomDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

export function generateTestCreditorData() {
  return {
    creditor_name: generateRandomString(10),
    institution_code: generateRandomNumericString(6),
    institution_name: generateRandomString(15),
    approval_date: generateRandomDate(),
    signer_name: generateRandomString(8),
    signer_position: generateRandomString(12),
  };
}

export function generateTestAddDebtorToCreditorData() {
  return {
    debtor_name: generateRandomString(10),
    creditor_name: generateRandomString(10),
    application_date: generateRandomDate(),
    approval_date: generateRandomDate(),
    url_KTP: `https://example.com/${generateRandomString(8)}.jpg`,
    url_approval: `https://example.com/${generateRandomString(8)}.pdf`,
  };
}
