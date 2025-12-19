export const getAuthHeader = () => {
  const token = JSON.parse(localStorage.getItem('eduhub-user')).token
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

export const getMultiPartAuthHeader = () => {
  const token = JSON.parse(localStorage.getItem('eduhub-user')).token
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  }
}

export const getS3Credintials = () => ({
  accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY
})
