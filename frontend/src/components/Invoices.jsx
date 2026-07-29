import React, { useState, useEffect } from 'react'
import { FileSpreadsheet, Trash2, Printer } from 'lucide-react'
import Receipt from './Receipt'

export default function Invoices({ invoices, rooms, showToast, refreshData }) {
  const today = new Date()
  
  // Invoice form state
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const defaultMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const [monthYear, setMonthYear] = useState(defaultMonthYear)
  const [year, month] = monthYear.split('-').map(Number)
  const [elecOld, setElecOld] = useState('')
  const [elecNew, setElecNew] = useState('')
  const [waterOld, setWaterOld] = useState('')
  const [waterNew, setWaterNew] = useState('')

  // Receipt modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Occupied rooms for dropdown selection
  const occupiedRooms = rooms.filter(r => r.status === 'occupied')

  // Auto-load indices when selected room changes
  const handleRoomChange = async (roomId) => {
    setSelectedRoomId(roomId)
    if (!roomId) {
      setElecOld('')
      setWaterOld('')
      return
    }

    try {
      const res = await fetch(`/api/invoices/room/${roomId}/latest`)
      if (res.ok) {
        const latest = await res.json()
        setElecOld(latest.elec_new ?? 0)
        setWaterOld(latest.water_new ?? 0)
        
        if (latest.message) {
          showToast('Đây là hóa đơn đầu tiên của phòng này.', 'success')
        }
      }
    } catch (err) {
      console.error(err)
      showToast('Lỗi khi tải chỉ số điện nước cũ.', 'error')
    }
  }

  // Handle invoice submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedRoomId) {
      showToast('Vui lòng chọn phòng!', 'error')
      return
    }

    const payload = {
      room_id: selectedRoomId,
      month: parseInt(month),
      year: parseInt(year),
      elec_old: parseFloat(elecOld),
      elec_new: parseFloat(elecNew),
      water_old: parseFloat(waterOld),
      water_new: parseFloat(waterNew)
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setSelectedRoomId('')
        setElecOld('')
        setElecNew('')
        setWaterOld('')
        setWaterNew('')
        showToast('Đã tạo hóa đơn tiền phòng thành công!')
        refreshData()
      } else {
        const errData = await res.json()
        showToast(`Lỗi: ${errData.error}`, 'error')
      }
    } catch (err) {
      showToast('Lỗi gửi dữ liệu!', 'error')
    }
  }

  // Toggle invoice pay status
  const handleTogglePay = async (id) => {
    try {
      const res = await fetch(`/api/invoices/${id}/toggle-pay`, { method: 'PUT' })
      if (res.ok) {
        const data = await res.json()
        showToast(data.is_paid ? 'Đã thu tiền hóa đơn!' : 'Đã đổi trạng thái sang Chưa thu')
        refreshData()
      }
    } catch (err) {
      showToast('Lỗi cập nhật trạng thái thanh toán!', 'error')
    }
  }

  // Delete invoice
  const handleDeleteInvoice = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Đã xóa hóa đơn thành công!')
        refreshData()
      }
    } catch (err) {
      showToast('Lỗi khi xóa hóa đơn', 'error')
    }
  }

  // Sort invoices by Year desc, Month desc
  const sortedInvoices = [...invoices].sort(
    (a, b) => b.year - a.year || b.month - a.month
  )

  return (
    <div id="invoices" className="tab-panel active">
      <div className="content-header">
        <div className="page-title">
          <h1>Tính Hóa Đơn Điện Nước & Tiền Phòng</h1>
          <p>Hệ thống tự động lưu trữ, tính tiền dịch vụ và hiển thị dạng biên lai tiện lợi.</p>
        </div>
      </div>

      <div className="form-grid">
        {/* Left Side: Create Invoice */}
        <div className="glass-panel" style={{ gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={18} />
            Tạo Hóa Đơn Dịch Vụ
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label htmlFor="formSelectRoom">Chọn Phòng:</label>
              <select 
                id="formSelectRoom" 
                className="form-control" 
                value={selectedRoomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                required
              >
                <option value="">-- Chọn phòng đang thuê --</option>
                {occupiedRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.room_number} ({r.tenant_name || 'Khách thuê'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label htmlFor="formMonthYear">Tháng / Năm Hóa Đơn:</label>
              <input 
                type="month" 
                id="formMonthYear" 
                className="form-control" 
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                required 
              />
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '12px' }}>
              <div className="form-group">
                <label htmlFor="formElecOld">Số điện Cũ (kWh):</label>
                <input 
                  type="number" 
                  step="any"
                  id="formElecOld" 
                  className="form-control" 
                  value={elecOld}
                  onChange={(e) => setElecOld(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="formElecNew">Số điện Mới (kWh):</label>
                <input 
                  type="number" 
                  step="any"
                  id="formElecNew" 
                  className="form-control" 
                  value={elecNew}
                  onChange={(e) => setElecNew(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '16px' }}>
              <div className="form-group">
                <label htmlFor="formWaterOld">Số nước Cũ (m³):</label>
                <input 
                  type="number" 
                  step="any"
                  id="formWaterOld" 
                  className="form-control" 
                  value={waterOld}
                  onChange={(e) => setWaterOld(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="formWaterNew">Số nước Mới (m³):</label>
                <input 
                  type="number" 
                  step="any"
                  id="formWaterNew" 
                  className="form-control" 
                  value={waterNew}
                  onChange={(e) => setWaterNew(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style={{ width: '100%' }}>
              Tạo & Tính Tiền Hóa Đơn
            </button>
          </form>
        </div>

        {/* Right Side: Invoice list history */}
        <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Danh Sách Lịch Sử Hóa Đơn</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tháng/Năm</th>
                  <th>Phòng</th>
                  <th>Khách hàng</th>
                  <th>Số Điện (Dùng)</th>
                  <th>Số Nước (Dùng)</th>
                  <th>Tổng Hóa Đơn</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      Không có hóa đơn dịch vụ nào.
                    </td>
                  </tr>
                ) : (
                  sortedInvoices.map(inv => {
                    return (
                      <tr key={inv.id}>
                        <td>Tháng {inv.month}/{inv.year}</td>
                        <td><strong>{inv.room_number || 'Phòng cũ'}</strong></td>
                        <td>{inv.tenant_name || 'Khách cũ'}</td>
                        <td>
                          {inv.elec_usage} kWh <br />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ({inv.elec_old}→{inv.elec_new})
                          </span>
                        </td>
                        <td>
                          {inv.water_usage} m³ <br />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ({inv.water_old}→{inv.water_new})
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {inv.total.toLocaleString('vi-VN')} đ
                        </td>
                        <td>
                          <button
                            className={`badge ${
                              inv.is_paid ? 'badge-vacant' : 'badge-occupied'
                            }`}
                            onClick={() => handleTogglePay(inv.id)}
                            style={{ 
                              cursor: 'pointer',
                              border: '1px solid currentColor',
                              background: inv.is_paid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: inv.is_paid ? 'var(--success)' : 'var(--danger)'
                            }}
                          >
                            {inv.is_paid ? 'Đã thu' : 'Chưa thu'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              Biên Lai
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              style={{ color: 'var(--danger)' }}
                              onClick={() => handleDeleteInvoice(inv.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Receipt Modal Overlay */}
      {selectedInvoice && (
        <Receipt 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}

    </div>
  )
}
