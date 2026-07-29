import React, { useState, useEffect } from 'react'
import { LayoutGrid, Home, DollarSign, AlertCircle } from 'lucide-react'

export default function Dashboard({ rooms, invoices, showToast, refreshData }) {
  const today = new Date()
  const defaultMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonthYear, setSelectedMonthYear] = useState(defaultMonthYear)
  const [unpaidInvoices, setUnpaidInvoices] = useState([])
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    collectedRevenue: 0,
    unpaidInvoicesCount: 0
  })

  const [selectedYear, selectedMonth] = selectedMonthYear.split('-').map(Number)

  // Calculate statistics whenever inputs change
  useEffect(() => {
    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length

    // Filter invoices matching target month & year
    const currentMonthInvoices = invoices.filter(
      inv => inv.month === selectedMonth && inv.year === selectedYear
    )

    const collectedRevenue = currentMonthInvoices
      .filter(inv => inv.is_paid)
      .reduce((sum, inv) => sum + inv.total, 0)

    const pendingInvoices = currentMonthInvoices.filter(inv => !inv.is_paid)

    setStats({
      totalRooms,
      occupiedRooms,
      collectedRevenue,
      unpaidInvoicesCount: pendingInvoices.length
    })

    setUnpaidInvoices(pendingInvoices)
  }, [rooms, invoices, selectedMonthYear])

  return (
    <div id="dashboard" className="tab-panel active">
      <div className="content-header">
        <div className="page-title">
          <h1>Tổng Quan Hệ Thống</h1>
          <p>Thông tin thống kê nhanh trạng thái cho thuê và hóa đơn tháng này.</p>
        </div>
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="monthPicker" style={{ margin: 0, fontWeight: '600' }}>Chọn Tháng/Năm:</label>
          <input 
            type="month" 
            id="monthPicker" 
            className="form-control" 
            style={{ width: '180px', cursor: 'pointer' }} 
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
          />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <LayoutGrid size={24} />
          </div>
          <div className="stat-info">
            <h3>Tổng số phòng</h3>
            <p>{stats.totalRooms}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            <Home size={24} />
          </div>
          <div className="stat-info">
            <h3>Phòng đang thuê</h3>
            <p>{stats.occupiedRooms}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>Doanh thu đã thu</h3>
            <p>{stats.collectedRevenue.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Hóa đơn chưa thu</h3>
            <p>{stats.unpaidInvoicesCount}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>
          Hóa Đơn Chưa Thanh Toán Tháng {selectedMonth}/{selectedYear}
        </h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Khách thuê</th>
                <th>Tháng/Năm</th>
                <th>Tổng hóa đơn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {unpaidInvoices.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    Không có hóa đơn nợ nào trong tháng này!
                  </td>
                </tr>
              ) : (
                unpaidInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td><strong>{inv.room_number || 'Phòng cũ'}</strong></td>
                    <td>{inv.tenant_name || 'Khách cũ'}</td>
                    <td>Tháng {inv.month}/{inv.year}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      {inv.total.toLocaleString('vi-VN')} đ
                    </td>
                    <td>
                      <span 
                        className="badge badge-vacant" 
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          color: 'var(--danger)', 
                          borderColor: 'rgba(239, 68, 68, 0.3)' 
                        }}
                      >
                        Chưa thu
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
