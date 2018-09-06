const loadImage = require('blueimp-load-image')
import dataUrlToBlob from './dataUrlToBlob'
import { MAX_SIZE } from './config'

export default file => {
  return new Promise((resolve, reject) => {
    try {
      loadImage(
        file,
        data => {
          if (data.type === 'error') {
            return reject(new Error('Wrong type of file'))
          }
          const dataUrl = data.toDataURL('image/jpeg')
          resolve({ image: dataUrlToBlob(dataUrl), preview: dataUrl })
        },
        {
          maxWidth: MAX_SIZE,
          maxHeight: MAX_SIZE,
          orientation: true,
        },
      )
    } catch (error) {
      return reject(error)
    }
  })
}
