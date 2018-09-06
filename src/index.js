import imageResize from './imageResize'
import {
  SCAN_FETCH_DELAY,
  SCAN_FETCH_TIMES,
  REST_API_ENDPOINT,
  SCAN_REFETCH_DELAY,
  SCAN_STATUS_SUCCESS,
  SCAN_STATUS_FAILURE,
} from './config'

/**
 * Creates a scan
 * @param {file} file
 * @param {string} api_key
 * @callback {function} setPreview(optional) returns preview base64 minified image
 * @return {promise}
 **/
export default (api_key, file, setPreview = () => {}) => {
  let fetchTimer = SCAN_FETCH_TIMES

  const _getUploadUrl = () =>
    fetch(`${REST_API_ENDPOINT}/presigned_url`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        api_key,
      },
      method: 'POST',
      body: JSON.stringify({
        type: 'scan',
        filename: file.name,
      }),
    }).then(response => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response.json()
    })

  const _uploadFile = (image, uploadUrl) => {
    return fetch(uploadUrl, {
      headers: {
        'content-type': file.type,
      },
      method: 'PUT',
      body: image,
    })
  }

  const _createScan = image_uuid => {
    return fetch(`${REST_API_ENDPOINT}/scans`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        api_key,
      },
      method: 'POST',
      body: JSON.stringify({
        image_filename: file.name,
        image_uuid,
      }),
    }).then(response => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response.json()
    })
  }

  const _fetchScan = id => {
    return fetch(`${REST_API_ENDPOINT}/scans/${id}`, {
      headers: {
        api_key,
      },
      method: 'GET',
    }).then(response => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response.json()
    })
  }

  const _getRedirectUrl = (id, resolve, reject) => {
    --fetchTimer
    return _fetchScan(id)
      .then(({ status, redirect_url }) => {
        if (redirect_url) {
          resolve(redirect_url)
        } else if (
          (!redirect_url && status === SCAN_STATUS_SUCCESS) ||
          !fetchTimer ||
          status === SCAN_STATUS_FAILURE
        ) {
          reject(new Error('Scan does not match'))
        } else {
          setTimeout(() => {
            _getRedirectUrl(id, resolve, reject)
          }, SCAN_REFETCH_DELAY)
        }
      })
      .catch(error => {
        reject(error)
      })
  }

  return new Promise((resolve, reject) => {
    if (!api_key || typeof api_key !== 'string') {
      return reject(
        new Error(
          `field "api_key" must be defined and be type of "string", gained ${typeof api_key}`,
        ),
      )
    }
    if (!file) {
      return reject(
        new Error(`field "file" must be defined and be type of "object", gained ${typeof file}`),
      )
    }

    imageResize(file)
      .then(({ image, preview }) => {
        setPreview(preview)
        _getUploadUrl()
          .then(({ uuid, upload_url }) => {
            _uploadFile(image, upload_url).catch(error => {
              reject(error)
            })
            _createScan(uuid)
              .then(({ id }) => {
                setTimeout(() => {
                  _getRedirectUrl(id, resolve, reject)
                }, SCAN_FETCH_DELAY)
              })
              .catch(error => {
                reject(error)
              })
          })
          .catch(error => {
            reject(error)
          })
      })
      .catch(error => {
        reject(error)
      })
  })
}
