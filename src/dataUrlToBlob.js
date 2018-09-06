const dataURItoBlob = dataURI => {
  const binary = atob(dataURI.split(',')[1])
  let binaries = []
  for (let i = 0; i < binary.length; i++) {
    binaries.push(binary.charCodeAt(i))
  }
  return new Blob([new Uint8Array(binaries)], { type: 'image/jpeg' })
}

export default dataURItoBlob
