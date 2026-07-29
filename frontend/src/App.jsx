import React, { useState, useEffect } from 'react'
import { Home, ClipboardList, Users, FileSpreadsheet, LogIn, LogOut, Key, User, Eye, EyeOff } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Rooms from './components/Rooms'
import Tenants from './components/Tenants'
import Invoices from './components/Invoices'
import MyRoom from './components/MyRoom'
import Profile from './components/Profile'

// Beautiful Login & Register Component
function LoginScreen({ onLoginSuccess, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('login') // 'login' or 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Register states
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  // Password visibility states
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [showRegPass, setShowRegPass] = useState(false)
  const [showRegConfPass, setShowRegConfPass] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Đăng nhập thành công!')
        onLoginSuccess(data.user)
      } else {
        setError(data.error || 'Đăng nhập thất bại!')
        showToast(data.error || 'Đăng nhập thất bại!', 'error')
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ backend!')
      showToast('Lỗi mạng!', 'error')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không trùng khớp!')
      showToast('Đăng ký thất bại!', 'error')
      return
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          password,
          confirm_password: confirmPassword
        })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
        setActiveSubTab('login')
        setUsername(email)
        setPassword('')
        setEmail('')
        setPhone('')
        setConfirmPassword('')
      } else {
        setError(data.error || 'Đăng ký thất bại!')
        showToast(data.error || 'Đăng ký thất bại!', 'error')
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ backend!')
      showToast('Lỗi mạng!', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
        {/* Sub Tabs Toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'login' ? '3px solid var(--accent-primary)' : 'none',
              fontWeight: '700',
              color: activeSubTab === 'login' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            onClick={() => { setActiveSubTab('login'); setError(''); }}
          >
            ĐĂNG NHẬP
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'register' ? '3px solid var(--accent-primary)' : 'none',
              fontWeight: '700',
              color: activeSubTab === 'register' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            onClick={() => { setActiveSubTab('register'); setError(''); }}
          >
            ĐĂNG KÝ
          </button>
        </div>

        {activeSubTab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="loginUser" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Tài khoản hoặc Email:</label>
              <input
                type="text"
                id="loginUser"
                className="form-control"
                placeholder="Nhập tên tài khoản hoặc email..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="loginPass" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Mật khẩu:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPass ? "text" : "password"}
                  id="loginPass"
                  className="form-control"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: '600' }}>⚠️ {error}</div>}
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '12px' }}>
              Xác Nhận Đăng Nhập
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label htmlFor="regEmail" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Địa chỉ Email:</label>
              <input
                type="email"
                id="regEmail"
                className="form-control"
                placeholder="Ví dụ: nva@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="regPhone" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Số điện thoại liên lạc:</label>
              <input
                type="tel"
                id="regPhone"
                className="form-control"
                placeholder="Nhập SĐT"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="regPass" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Mật khẩu:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showRegPass ? "text" : "password"}
                  id="regPass"
                  className="form-control"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPass(!showRegPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showRegPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="regConfPass" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Xác nhận mật khẩu:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showRegConfPass ? "text" : "password"}
                  id="regConfPass"
                  className="form-control"
                  placeholder="Nhập lại mật khẩu để xác nhận..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfPass(!showRegConfPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showRegConfPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: '600' }}>⚠️ {error}</div>}
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '12px' }}>
              Xác Nhận Đăng Ký Tài Khoản
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const role = user ? user.role : 'user'
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/')
  const [rooms, setRooms] = useState([])
  const [tenants, setTenants] = useState([])
  const [invoices, setInvoices] = useState([])

  // Watch for hash changes in URL bar
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/')
    }
    window.addEventListener('hashchange', handleHashChange)

    if (!window.location.hash) {
      window.location.hash = '#/'
    }

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Sync role to route permissions
  useEffect(() => {
    const r = window.location.hash || '#/'
    if (role === 'user' && r.startsWith('#/admin')) {
      window.location.hash = '#/'
    }
    if (role === 'tenant' && r.startsWith('#/admin')) {
      window.location.hash = '#/'
    }
  }, [role, currentRoute])

  const fetchData = async () => {
    try {
      const [roomsRes, tenantsRes, invoicesRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/tenants'),
        fetch('/api/invoices')
      ])

      if (roomsRes.ok && tenantsRes.ok && invoicesRes.ok) {
        const [roomsData, tenantsData, invoicesData] = await Promise.all([
          roomsRes.json(),
          tenantsRes.json(),
          invoicesRes.json()
        ])
        setRooms(roomsData)
        setTenants(tenantsData)
        setInvoices(invoicesData)
      } else {
        showToast('Lỗi kết nối máy chủ backend!', 'error')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      showToast('Lỗi kết nối máy chủ backend!', 'error')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer')
    if (!container) return

    const toast = document.createElement('div')
    toast.className = `toast ${type}`

    const icon = document.createElement('span')
    icon.className = 'toast-icon'
    icon.innerText = type === 'success' ? '✓' : '✗'

    const text = document.createElement('span')
    text.innerText = message

    toast.appendChild(icon)
    toast.appendChild(text)
    container.appendChild(toast)

    setTimeout(() => toast.classList.add('show'), 10)

    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    window.location.hash = '#/' // Go to room list
    showToast('Đã đăng xuất!')
  }

  const navigateTo = (hash) => {
    window.location.hash = hash
  }

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <div id="toastContainer"></div>

      <aside className="sidebar">
        <div className="brand" onClick={() => navigateTo('#/')} style={{ cursor: 'pointer', marginBottom: '8px' }}>
          <Home size={22} />
          <span>QL Phòng Trọ</span>
        </div>

        {/* Profile Information Widget when User is Logged In */}
        {user && (
          <div
            onClick={() => navigateTo('#/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            title="Nhấp để cập nhật hồ sơ"
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: role === 'admin' ? 'var(--danger-bg)' : 'var(--accent-primary)',
              color: role === 'admin' ? 'var(--danger)' : 'white',
              border: `1px solid ${role === 'admin' ? 'var(--danger-border)' : 'var(--accent-primary)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px',
              flexShrink: 0
            }}>
              {role === 'admin' ? 'AD' : user.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {role === 'admin' ? 'admin@apartment.com' : `SĐT: ${user.phone}`}
              </div>
            </div>
          </div>
        )}

        <ul className="menu-list">
          {role === 'admin' && (
            <li>
              <button
                className={`menu-item ${currentRoute === '#/admin/dashboard' ? 'active' : ''}`}
                onClick={() => navigateTo('#/admin/dashboard')}
              >
                <Home size={18} />
                Tổng Quan
              </button>
            </li>
          )}

          <li>
            <button
              className={`menu-item ${currentRoute === '#/' || currentRoute === '#/rooms' ? 'active' : ''}`}
              onClick={() => navigateTo('#/')}
            >
              <ClipboardList size={18} />
              {role === 'admin' ? 'Phòng Trọ' : 'Danh Sách Phòng'}
            </button>
          </li>

          {role === 'tenant' && (
            <li>
              <button
                className={`menu-item ${currentRoute === '#/tenant/my-room' ? 'active' : ''}`}
                onClick={() => navigateTo('#/tenant/my-room')}
              >
                <Key size={18} />
                Phòng Của Tôi
              </button>
            </li>
          )}

          {role === 'admin' && (
            <>
              <li>
                <button
                  className={`menu-item ${currentRoute === '#/admin/tenants' ? 'active' : ''}`}
                  onClick={() => navigateTo('#/admin/tenants')}
                >
                  <Users size={18} />
                  Khách Thuê
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${currentRoute === '#/admin/invoices' ? 'active' : ''}`}
                  onClick={() => navigateTo('#/admin/invoices')}
                >
                  <FileSpreadsheet size={18} />
                  Hóa Đơn
                </button>
              </li>
            </>
          )}

          {user && (
            <li>
              <button
                className={`menu-item ${currentRoute === '#/profile' ? 'active' : ''}`}
                onClick={() => navigateTo('#/profile')}
              >
                <User size={18} />
                Thông Tin Cá Nhân
              </button>
            </li>
          )}
        </ul>

        {/* Sidebar Footer for Login/Logout */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          {!user ? (
            <button
              className={`btn btn-primary ${currentRoute === '#/login' ? 'active' : ''}`}
              style={{ width: '100%' }}
              onClick={() => navigateTo('#/login')}
            >
              <LogIn size={16} />
              Đăng nhập
            </button>
          ) : (
            <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--danger)', borderColor: 'rgba(211,47,47,0.2)' }} onClick={handleLogout}>
              <LogOut size={16} />
              Đăng xuất
            </button>
          )}
        </div>
      </aside>

      <main className="main-content">
        {(currentRoute === '#/' || currentRoute === '#/rooms') && (
          <Rooms
            rooms={rooms}
            role={role}
            user={user}
            showToast={showToast}
            refreshData={fetchData}
          />
        )}
        {currentRoute === '#/admin/dashboard' && role === 'admin' && (
          <Dashboard
            rooms={rooms}
            invoices={invoices}
            showToast={showToast}
            refreshData={fetchData}
          />
        )}
        {currentRoute === '#/admin/tenants' && role === 'admin' && (
          <Tenants
            tenants={tenants}
            rooms={rooms}
            showToast={showToast}
            refreshData={fetchData}
          />
        )}
        {currentRoute === '#/admin/invoices' && role === 'admin' && (
          <Invoices
            rooms={rooms}
            invoices={invoices}
            showToast={showToast}
            refreshData={fetchData}
          />
        )}
        {currentRoute === '#/tenant/my-room' && role === 'tenant' && (
          <MyRoom
            user={user}
            rooms={rooms}
            invoices={invoices}
            showToast={showToast}
            refreshData={fetchData}
          />
        )}
        {currentRoute === '#/profile' && user && (
          <Profile
            user={user}
            onProfileUpdate={(updatedUser) => {
              setUser(updatedUser)
              localStorage.setItem('user', JSON.stringify(updatedUser))
              fetchData()
            }}
            showToast={showToast}
          />
        )}
        {currentRoute === '#/login' && (
          <LoginScreen
            onLoginSuccess={(userData) => {
              setUser(userData)
              localStorage.setItem('user', JSON.stringify(userData))
              if (userData.role === 'admin') {
                navigateTo('#/admin/dashboard')
              } else {
                navigateTo('#/tenant/my-room')
              }
            }}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  )
}
