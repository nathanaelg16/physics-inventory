import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export function formatDate(dateString: string) {
    if (!dateString) return 'Unknown date'

    try {
        let date;
        // For ISO format with timezone (Z)
        if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+') || dateString.includes('-'))) {
            date = dayjs(dateString).utc()
        } else {
            // For other formats without timezone info, try the formats
            date = dayjs(dateString, ["YYYY-MM-DD", "DD-MMM-YYYY"])
        }

        return date.format("YYYY-MM-DD")
    } catch (e) {
        return dateString
    }
}

function guessMimeType(byteArray: Uint8Array) {
    const header = Array.from(byteArray.slice(0, 4))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    console.log('byteArray', byteArray)
    console.log('header: ', header)

    switch (header) {
        case '89504e47': return 'image/png'; // PNG signature
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2': return 'image/jpeg'; // JPEG signature
        default: return 'application/octet-stream'; // Fallback
    }
}

export function generateImage(imageArray: Array<number>) {
    console.log('imageArray: ', imageArray)
    const byteArray = new Uint8Array(imageArray)
    const mimeType = guessMimeType(byteArray)
    console.log('mimeType: ', mimeType)
    const blob = new Blob([byteArray], { type: mimeType })
    return URL.createObjectURL(blob)
}