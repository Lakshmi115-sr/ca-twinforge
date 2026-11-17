// src/utils/taxEngine.js

export function calculateMSMECompliance(invoiceDate, actualPaymentDate, amount) {
  const invDate = new Date(invoiceDate);
  const payDate = actualPaymentDate ? new Date(actualPaymentDate) : null;
  const statutoryLimitDays = 45; 
  const dueDate = new Date(invDate);
  dueDate.setDate(dueDate.getDate() + statutoryLimitDays);

  let status = "Compliant";
  let daysDelayed = 0;

  if (payDate) {
    const diffTime = payDate - dueDate;
    daysDelayed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysDelayed > 0) {
      status = `Disallowable under Sec 43B(h) (${daysDelayed} days delayed)`;
    }
  } else {
    status = "Pending Payment - Disallowance Risk if unpaid at year-end";
  }

  return {
    invoiceDate: invDate.toISOString().slice(0, 10),
    dueDate: dueDate.toISOString().slice(0, 10),
    amount: Number(amount),
    status,
  };
}

export function calculateGSTInterest(taxShortfall, delayInDays) {
  const annualRate = 0.18;
  const interest = (taxShortfall * annualRate * (delayInDays / 365)).toFixed(2);
  return {
    taxShortfall: Number(taxShortfall),
    delayInDays: Number(delayInDays),
    interestPayable: Number(interest),
  };
}