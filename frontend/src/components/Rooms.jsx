import React, { useState } from 'react'
import { Plus, Edit3, Trash2, Key, LogOut } from 'lucide-react'

export default function Rooms({ rooms, role, user, showToast, refreshData }) {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Room Modal State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null) // null for create, room object for edit
  const [roomNumber, setRoomNumber] = useState('')
  const [price, setPrice] = useState(3000000)
  const [elecRate, setElecRate] = useState(3500)
  const [waterRate, setWaterRate] = useState(20000)
  const [imageUrl, setImageUrl] = useState('')

  // Handle local image file upload & convert to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Kích thước ảnh tối đa là 2MB!', 'error')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Rent Modal State
  const [isRentModalOpen, setIsRentModalOpen] = useState(false)
  const [rentRoomId, setRentRoomId] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [tenantPhone, setTenantPhone] = useState('')
  const [tenantIdentity, setTenantIdentity] = useState('')
  const [deposit, setDeposit] = useState(3000000)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  // Filters & Search
  const filteredRooms = rooms
    .filter(r => {
      if (filter === 'vacant') return r.status === 'vacant'
      if (filter === 'occupied') return r.status === 'occupied'
      return true
    })
    .filter(r => r.room_number.toLowerCase().includes(searchQuery.toLowerCase()))

  // Open Room Modal
  const openRoomModal = (room = null) => {
    if (room) {
      setEditingRoom(room)
      setRoomNumber(room.room_number)
      setPrice(room.price)
      setElecRate(room.electricity_rate)
      setWaterRate(room.water_rate)
      setImageUrl(room.image_url || '')
    } else {
      setEditingRoom(null)
      setRoomNumber('')
      setPrice(3000000)
      setElecRate(3500)
      setWaterRate(20000)
      setImageUrl('')
    }
    setIsRoomModalOpen(true)
  }

  // Close Room Modal
  const closeRoomModal = () => {
    setIsRoomModalOpen(false)
    setEditingRoom(null)
  }

  // Handle Room Form Submit
  const handleRoomSubmit = async (e) => {
    e.preventDefault()
    
    const payload = {
      room_number: roomNumber,
      price: parseFloat(price),
      electricity_rate: parseFloat(elecRate),
      water_rate: parseFloat(waterRate),
      image_url: imageUrl
    }

    const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms'
    const method = editingRoom ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        showToast(editingRoom ? 'Cập nhật phòng thành công!' : 'Đã thêm phòng mới!')
        closeRoomModal()
        refreshData()
      } else {
        const errData = await res.json()
        showToast(`Lỗi: ${errData.error}`, 'error')
      }
    } catch (err) {
      showToast('Lỗi kết nối mạng!', 'error')
    }
  }

  // Handle Delete Room
  const handleDeleteRoom = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng này?')) return

    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Đã xóa phòng thành công!')
        refreshData()
      } else {
        const errData = await res.json()
        showToast(`Lỗi: ${errData.error}`, 'error')
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ!', 'error')
    }
  }

  // Open Rent Modal
  const openRentModal = (roomId, roomPrice) => {
    setRentRoomId(roomId)
    setDeposit(roomPrice)
    if (user && role === 'tenant') {
      setTenantName(user.name)
      setTenantPhone(user.phone)
    } else {
      setTenantName('')
      setTenantPhone('')
    }
    setTenantIdentity('')
    setStartDate(new Date().toISOString().split('T')[0])
    setIsRentModalOpen(true)
  }

  // Close Rent Modal
  const closeRentModal = () => {
    setIsRentModalOpen(false)
  }

  // Handle Rent Submit
  const handleRentSubmit = async (e) => {
    e.preventDefault()

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
        closeRentModal()
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
    if (!confirm(`Xác nhận TRẢ PHÒNG cho phòng ${roomNumber}? Hợp đồng thuê sẽ được chấm dứt.`)) return

    try {
      const res = await fetch(`/api/tenants/${tenantId}/checkout`, { method: 'POST' })
      if (res.ok) {
        showToast(`Đã trả phòng thành công cho phòng ${roomNumber}`)
        refreshData()
      } else {
        const errData = await res.json()
        showToast(`Lỗi: ${errData.error}`, 'error')
      }
    } catch (err) {
      showToast('Lỗi hệ thống!', 'error')
    }
  }

  return (
    <div id="rooms" className="tab-panel active">
      <div className="content-header">
        <div className="page-title">
          <h1>Quản Lý Danh Sách Phòng</h1>
          <p>Xem, thêm mới, sửa và quản lý tình trạng phòng trọ của bạn.</p>
        </div>
        {role === 'admin' && (
          <button className="btn btn-primary" onClick={() => openRoomModal()}>
            <Plus size={16} />
            Thêm Phòng
          </button>
        )}
      </div>

      {/* Filter and search controls */}
      <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>Tất cả</button>
          <button className={`btn btn-sm ${filter === 'vacant' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('vacant')}>Trống ({rooms.filter(r=>r.status==='vacant').length})</button>
          <button className={`btn btn-sm ${filter === 'occupied' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('occupied')}>Đang thuê ({rooms.filter(r=>r.status==='occupied').length})</button>
        </div>
        <div style={{ minWidth: '240px' }}>
          <input 
            type="text" 
            placeholder="Tìm theo số phòng..." 
            className="form-control" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rooms-grid">
        {filteredRooms.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Không tìm thấy phòng nào phù hợp!
          </div>
        ) : (
          filteredRooms.map(r => {
            const isOccupied = r.status === 'occupied'
            return (
              <div key={r.id} className={`room-card ${isOccupied ? 'status-occupied' : 'status-vacant'}`}>
                <img 
                  src={r.image_url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'} 
                  alt={`Phòng ${r.room_number}`} 
                  className="room-card-image"
                />

                <div className="room-info-content">
                  <div className="room-header">
                    <span className="room-number">PHÒNG TRỌ CAO CẤP - SỐ {r.room_number}</span>
                    <span className={`badge ${isOccupied ? 'badge-occupied' : 'badge-vacant'}`}>
                      {isOccupied ? 'Đang thuê' : 'Còn trống'}
                    </span>
                  </div>

                  <div className="room-price-tag">
                    {r.price.toLocaleString('vi-VN')} đ/tháng
                  </div>

                  <div className="room-details-inline">
                    <span>Diện tích: 30 m²</span>
                    <span className="dot">•</span>
                    <span>Điện: {r.electricity_rate.toLocaleString('vi-VN')} đ/kWh</span>
                    <span className="dot">•</span>
                    <span>Nước: {r.water_rate.toLocaleString('vi-VN')} đ/m³</span>
                  </div>

                  {isOccupied ? (
                    <div className="room-tenant-box">
                      <span className="room-tenant-title">Khách hàng thuê phòng</span>
                      <span className="room-tenant-name">👤 {r.tenant_name || 'Khách thuê'} - SĐT: {r.tenant_phone || 'N/A'}</span>
                    </div>
                  ) : (
                    <div className="room-tenant-box" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '10px 14px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>🏠 Căn phòng đang trống, sẵn sàng làm hợp đồng cho khách thuê mới.</span>
                    </div>
                  )}

                  <div className="room-actions-list">
                    {isOccupied ? (
                      role === 'admin' && (
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleCheckout(r.tenant_id, r.room_number)}
                          style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: '#fef2f2' }}
                        >
                          <LogOut size={14} />
                          Trả phòng (Check out)
                        </button>
                      )
                    ) : (
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => openRentModal(r.id, r.price)}
                      >
                        <Key size={14} />
                        Đăng ký thuê phòng
                      </button>
                    )}
                    {role === 'admin' && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => openRoomModal(r)}>
                          <Edit3 size={14} />
                          Sửa thông tin
                        </button>
                        {!isOccupied && (
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteRoom(r.id)}>
                            <Trash2 size={14} />
                            Xóa phòng
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 1. Add/Edit Room Modal Overlay */}
      {isRoomModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRoom ? `Sửa Thông Tin Phòng ${editingRoom.room_number}` : 'Thêm Phòng Trọ Mới'}
              </h3>
              <button className="modal-close" onClick={closeRoomModal}>&times;</button>
            </div>
            <form onSubmit={handleRoomSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="roomNumberInput">Số Phòng (Ví dụ: P.101):</label>
                <input 
                  type="text" 
                  id="roomNumberInput" 
                  className="form-control" 
                  placeholder="P.101" 
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required 
                />
              </div>
              <div class="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="priceInput">Giá Thuê Phòng (đ/tháng):</label>
                <input 
                  type="number" 
                  id="priceInput" 
                  className="form-control" 
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="elecRateInput">Đơn Giá Điện (đ/kWh):</label>
                <input 
                  type="number" 
                  id="elecRateInput" 
                  className="form-control" 
                  value={elecRate}
                  onChange={(e) => setElecRate(parseFloat(e.target.value) || 0)}
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="waterRateInput">Đơn Giá Nước (đ/m³):</label>
                <input 
                  type="number" 
                  id="waterRateInput" 
                  className="form-control" 
                  value={waterRate}
                  onChange={(e) => setWaterRate(parseFloat(e.target.value) || 0)}
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="roomImageFile">Hình Ảnh Minh Họa:</label>
                <input 
                  type="file" 
                  id="roomImageFile" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {imageUrl && (
                  <div style={{ marginTop: '12px', position: 'relative', textAlign: 'center' }}>
                    <img 
                      src={imageUrl} 
                      alt="Xem trước ảnh phòng" 
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} 
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm" 
                      style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none' }}
                      onClick={() => setImageUrl('')}
                    >
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeRoomModal}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Rent Room Modal Overlay */}
      {isRentModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Đăng Ký Khách Thuê Phòng</h3>
              <button className="modal-close" onClick={closeRentModal}>&times;</button>
            </div>
            <form onSubmit={handleRentSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Phòng đăng ký:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={rooms.find(r => r.id === rentRoomId)?.room_number || ''} 
                  disabled 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="tenantNameInput">Tên Khách Thuê:</label>
                <input 
                  type="text" 
                  id="tenantNameInput" 
                  className="form-control" 
                  placeholder="Nguyễn Văn A" 
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="tenantPhoneInput">Số Điện Thoại:</label>
                <input 
                  type="text" 
                  id="tenantPhoneInput" 
                  className="form-control" 
                  placeholder="09xxxxxxxx" 
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="tenantIdentityInput">Số CCCD / CMND:</label>
                <input 
                  type="text" 
                  id="tenantIdentityInput" 
                  className="form-control" 
                  placeholder="03xxxxxxxxxx" 
                  value={tenantIdentity}
                  onChange={(e) => setTenantIdentity(e.target.value)}
                  required 
                />
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
                <div className="form-group">
                  <label htmlFor="tenantDepositInput">Tiền Đặt Cọc (đ):</label>
                  <input 
                    type="number" 
                    id="tenantDepositInput" 
                    className="form-control" 
                    value={deposit}
                    onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tenantStartDateInput">Ngày Nhận Phòng:</label>
                  <input 
                    type="date" 
                    id="tenantStartDateInput" 
                    className="form-control" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeRentModal}>Hủy</button>
                <button type="submit" className="btn btn-primary">Xác Nhận Hợp Đồng</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
