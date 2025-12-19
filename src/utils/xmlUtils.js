export function isValidXml(xmlString) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'application/xml');
        const hasError = doc.getElementsByTagName('parsererror')?.length > 0;
        return !hasError;
    } catch {
        return false;
    }
}

export async function readXmlFileToString(file) {
    if (!file) return '';
    const allowedTypes = ['text/xml', 'application/xml'];
    const isXmlType = allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.xml');
    if (!isXmlType) {
        throw new Error('The file should be .xml');
    }
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('The XML file exceeds 2MB.');
    }
    const text = await file.text();
    return text;
}