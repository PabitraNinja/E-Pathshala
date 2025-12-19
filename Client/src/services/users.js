import api from './api'
import { getAuthHeader } from './config'

const register = async (credentials) => {
  const response = await api.post('/users/register', credentials)
  return response.data
}

const login = async (credentials) => {
  const response = await api.post('/users/login', credentials)
  return response.data
}

const logout = async () => {
  await api.post('/users/logout', undefined, getAuthHeader())
}

const update = async (user) => {
  const response = await api.patch(
    '/users/me',
    {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      username: user.username,
      photo: user.photo
    },
    getAuthHeader()
  )
  return response.data
}

const usersService = { register, login, logout, update }
export default usersService
