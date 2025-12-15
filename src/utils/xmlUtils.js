/**
 * Valida se a string é XML bem-formado.
 * Retorna true se não houver <parsererror> no documento.
 */
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

/**
 * Lê um ficheiro .xml para string
 */
export async function readXmlFileToString(file) {
    if (!file) return '';
    const allowedTypes = ['text/xml', 'application/xml'];
    // Alguns browsers podem não definir perfeitamente o type para .xml; aceita pela extensão também
    const isXmlType = allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.xml');
    if (!isXmlType) {
        throw new Error('O ficheiro deve ser .xml');
    }
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('O ficheiro XML excede 2MB.');
    }
    const text = await file.text();
    return text;
}