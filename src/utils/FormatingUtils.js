export function CapitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function FormatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString();
}

export function FormatDateTime(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleString();
}


export function FormatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: currency })
    .format(amount);
}

export function FormatPayFrequency(frequency) {
    switch (frequency) {
        case 1:
            return 'Monthly';
        case 2:
            return 'Biweekly';
        default:
            return 'Unknown';
    }
}
