import React, { useState } from 'react'
import { UserPlus, Trash2 } from 'lucide-react'

export default function Tenants({ tenants, rooms, showToast, refreshData }) {
  const [isRentModalOpen, setIsRentModalOpen] = useState(false)
  const [rentRoomId, setRentRoomId] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [tenantPhone, setTenantPhone] = useState('')
  const [tenantIdentity, setTenantIdentity] = useState('')
  const [deposit, setDeposit] = useState(3000000)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  // Vacant rooms for selection
  const vacantRooms = rooms.filter(r => r.status === 'vacant')

  // Open Rent Modal
  const openRentModal = () => {
    setRentRoomId('')
    setTenantName('')
    setTenantPhone('')
    setTenantIdentity('')
    setDeposit(3000000)
    setStartDate(new Date().toISOString().split('T')[0])
    setIsRentModalOpen(true)
  }

  // Handle Rent Form Submit
  const handleRentSubmit = async (e) => {
    e.preventDefault()

    if (!rentRoomId) {
      showToast('Vui lòng chọn phòng để thuê!', 'error')
      return
    }

    const payload = {
      room_id: rentRoomId,
      name: tenantName,
      phone: tenantPhone,
      identity_card: tenantIdentity,
      deposit: parseFloat(deposit),
      start_date: startDate
    }

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        showToast('Đăng ký khách thuê thành công!')
        setIsRentModalOpen(false)
        refreshData()
      } else {
        const errData = await res.json()
        showToast(`Lỗi: ${errData.error}`, 'error')
      }
    } catch (err) {
      showToast('Lỗi gửi dữ liệu!', 'error')
    }
  }

  // Handle Checkout
  const handleCheckout = async (tenantId, roomNumber) => {
    if (!confirm(`Xác nhận TRẢ PHÒNG cho phòng ${roomNumber || 'đang chọn'}? Hợp đồng thuê sẽ được kết thúc.`)) return

    try {
      const res = await fetch(`/api/tenants/${tenantId}/checkout`, { method: 'POST' })
      if (res.ok) {
        showToast(`Đã làm thủ tục trả phòng thành công!`)
        refreshData()
      } else {
        const errData = await res.json()
        showToast(`Lỗi: ${errData.error}`, 'error')
      }
    } catch (err) {
      showToast('Lỗi xử lý hệ thống!', 'error')
    }
  }

  // Handle Delete Tenant History
  const handleDeleteTenant = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn lịch sử khách thuê này?')) return
    try {
      const res = await fetch(`/api/tenants/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Đã xóa thông tin khách thuê khỏi lịch sử.')
        refreshData()
      } else {
        const errData = await res.json()
        showToast(`Lỗi: ${errData.error}`, 'error')
      }
    } catch (err) {
      showToast('Lỗi máy chủ!', 'error')
    }
  }

  // Auto-populate deposit when room changes in dropdown
  const handleRoomChange = (roomId) => {
    setRentRoomId(roomId)
    const selectedRoom = rooms.find(r => r.id === roomId)
    if (selectedRoom) {
      setDeposit(selectedRoom.price)
    }
  }

  return (
    <div id="tenants" className="tab-panel active">
      <div className="content-header">
        <div className="page-title">
          <h1>Quản Lý Hợp Đồng & Khách Thuê</h1>
          <p>Theo dõi danh sách khách trọ đang ở và lưu lịch sử khách đã chuyển đi.</p>
        </div>
        <button className="btn btn-primary" onClick={openRentModal}>
          <UserPlus size={18} />
          Đăng Ký Thuê Phòng
        </button>
      </div>

      <div className="glass-panel">
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Danh Sách Hợp Đồng Thuê</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>CCCD/CMND</th>
                <th>Phòng thuê</th>
                <th>Tiền cọc</th>
                <th>Ngày bắt đầu</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    Không có thông tin khách thuê phòng.
                  </td>
                </tr>
              ) : (
                tenants.map(t => {
                  const isActive = t.status === 'active'
                  return (
                    <tr key={t.id}>
                      <td><strong>{t.name}</strong></td>
                      <td>{t.phone}</td>
                      <td>{t.identity_card}</td>
                      <td>
                        {t.room_number ? (
                          <span className="badge badge-occupied" style={{ fontWeight: 'bold' }}>
                            {t.room_number}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Đã chuyển đi</span>
                        )}
                      </td>
                      <td>{t.deposit.toLocaleString('vi-VN')} đ</td>
                      <td>{t.start_date}</td>
                      <td>
                        {isActive ? (
                          <span className="badge badge-occupied">Đang ở</span>
                        ) : (
                          <span 
                            className="badge badge-vacant" 
                            style={{ 
                              background: 'rgba(255,255,255,0.05)', 
                              color: 'var(--text-muted)', 
                              border: '1px solid rgba(255,255,255,0.1)' 
                            }}
                          >
                            Đã trả phòng
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isActive ? (
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleCheckout(t.id, t.room_number)}
                          >
                            Trả phòng
                          </button>
                        ) : (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ color: 'var(--danger)' }} 
                            onClick={() => handleDeleteTenant(t.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rent Tenant Modal Overlay */}
      {isRentModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Đăng Ký Khách Thuê Phòng</h3>
              <button className="modal-close" onClick={() => setIsRentModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleRentSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="modalRentRoomSelect">Chọn Phòng Trống:</label>
                <select 
                  id="modalRentRoomSelect"
                  className="form-control" 
                  value={rentRoomId}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  required
                >
                  <option value="">-- Chọn phòng trống --</option>
                  {vacantRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.room_number} ({r.price.toLocaleString()}đ)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="modalTenantName">Tên Khách Thuê:</label>
                <input 
                  type="text" 
                  id="modalTenantName"
                  className="form-control" 
                  placeholder="Nguyễn Văn A" 
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="modalTenantPhone">Số Điện Thoại:</label>
                <input 
                  type="text" 
                  id="modalTenantPhone"
                  className="form-control" 
                  placeholder="09xxxxxxxx" 
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="modalTenantIdentity">Số CCCD / CMND:</label>
                <input 
                  type="text" 
                  id="modalTenantIdentity"
                  className="form-control" 
                  placeholder="03xxxxxxxxxx" 
                  value={tenantIdentity}
                  onChange={(e) => setTenantIdentity(e.target.value)}
                  required 
                />
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
                <div className="form-group">
                  <label htmlFor="modalTenantDeposit">Tiền Đặt Cọc (đ):</label>
                  <input 
                    type="number" 
                    id="modalTenantDeposit"
                    className="form-control" 
                    value={deposit}
                    onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modalTenantStartDate">Ngày Nhận Phòng:</label>
                  <input 
                    type="date" 
                    id="modalTenantStartDate"
                    className="form-control" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsRentModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Xác Nhận Hợp Đồng</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
