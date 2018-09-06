import Platform from 'platform'

const deviceData = {
  language: navigator.language,
  os_version: Platform.os.version,
  platform: Platform.os.family,
  browser: Platform.name,
}

export default deviceData
