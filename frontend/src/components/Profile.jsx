import React, { useState } from 'react'
import { User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Profile({ user, onProfileUpdate, showToast }) {
  const [name, setName] = useState(user.name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Password visibility states
  const [showPass, setShowPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      showToast('Cập nhật thất bại!', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name,
          phone,
          password
        })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Cập nhật tài khoản thành công!')
        onProfileUpdate(data.user)
        setPassword('')
        setConfirmPassword('')
      } else {
        setError(data.error || 'Cập nhật thất bại!')
        showToast(data.error || 'Cập nhật thất bại!', 'error')
      }
    } catch (err) {
      setError('Lỗi kết nối mạng!')
      showToast('Lỗi mạng!', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="content-header">
        <div className="page-title">
          <h1>Thông Tin Cá Nhân</h1>
          <p>Quản lý và cập nhật thông tin họ tên, số điện thoại, mật khẩu của bạn.</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Cập Nhật Hồ Sơ Người Dùng
          </h2>

          <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Địa chỉ Email (Tài khoản):</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  value={user.email || user.username}
                  disabled
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'not-allowed', paddingLeft: '36px' }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profName" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Họ và tên hiển thị:</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="profName"
                  className="form-control" 
                  placeholder="Nhập họ và tên thực tế..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ paddingLeft: '36px' }}
                />
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profPhone" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Số điện thoại liên lạc:</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="tel" 
                  id="profPhone"
                  className="form-control" 
                  placeholder="Nhập SĐT để khớp nối phòng ở..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{ paddingLeft: '36px' }}
                />
                <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '10px 0', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>Đổi mật khẩu (Bỏ trống nếu không đổi)</h3>
              
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="profPass" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Mật khẩu mới:</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPass ? "text" : "password"} 
                    id="profPass"
                    className="form-control" 
                    placeholder="Nhập mật khẩu mới..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '36px', paddingRight: '40px' }}
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
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
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="profConfPass" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Xác nhận mật khẩu mới:</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfPass ? "text" : "password"} 
                    id="profConfPass"
                    className="form-control" 
                    placeholder="Xác nhận lại mật khẩu..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '36px', paddingRight: '40px' }}
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setShowConfPass(!showConfPass)}
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
                    {showConfPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {error && <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: '600' }}>⚠️ {error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '12px', width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Cập Nhật Hồ Sơ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
