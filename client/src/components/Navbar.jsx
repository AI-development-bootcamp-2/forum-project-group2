import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', background: '#1a1a1a' }}>
      <Link to="/" style={{ fontWeight: 'bold', marginRight: 'auto', color: 'white', textDecoration: 'none' }}>Forum</Link>
      {user ? (
        <>
          <span style={{ color: 'white' }}>{user.username}</span>
          <button onClick={handleLogout} style={{ padding: '6px 14px', cursor: 'pointer' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login"><button style={{ padding: '6px 14px', cursor: 'pointer' }}>Login</button></Link>
          <Link to="/register"><button style={{ padding: '6px 14px', cursor: 'pointer' }}>Register</button></Link>
        </>
      )}
    </nav>
  )
}
