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

export default function generateImage(imageArray: Array<number>) {
    console.log('imageArray: ', imageArray)
    const byteArray = new Uint8Array(imageArray)
    const mimeType = guessMimeType(byteArray)
    console.log('mimeType: ', mimeType)
    const blob = new Blob([byteArray], { type: mimeType })
    return URL.createObjectURL(blob)
}
