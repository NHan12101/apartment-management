import React, { useState } from 'react'
import { Home, Calendar, DollarSign, FileText, CheckCircle, AlertCircle, Phone, CreditCard, ShieldAlert } from 'lucide-react'
import Receipt from './Receipt'

export default function MyRoom({ user, rooms, invoices, showToast, refreshData }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Find the room matching the user's phone number
  const myRoom = rooms.find(r => r.tenant_phone === user.phone && r.status === 'occupied')
  
  // Filter invoices for this room
  const myInvoices = myRoom 
    ? invoices.filter(inv => inv.room_id === myRoom.id).sort((a, b) => b.month - a.month || b.year - a.year)
    : []

  if (!myRoom) {
    return (
      <div style={{ padding: '20px 0' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <ShieldAlert size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Chưa đăng ký thuê phòng</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px auto', fontSize: '14.5px', lineHeight: '1.6' }}>
            Xin chào <strong>{user.name}</strong>, tài khoản của bạn với số điện thoại <strong>{user.phone}</strong> chưa được liên kết với bất kỳ phòng thuê nào trên hệ thống.
          </p>
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', display: 'inline-block', textAlign: 'left', border: '1px solid var(--border-color)', fontSize: '13.5px' }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>💡 Hướng dẫn liên kết phòng:</p>
            <p style={{ color: 'var(--text-secondary)' }}>1. Bạn vui lòng liên hệ Chủ nhà (Admin) qua số điện thoại để đăng ký làm hợp đồng ở.</p>
            <p style={{ color: 'var(--text-secondary)' }}>2. Đọc đúng số điện thoại <strong>{user.phone}</strong> để chủ nhà nhập vào hợp đồng thuê phòng.</p>
          </div>
          <div style={{ marginTop: '24px' }}>
            <a href="#/" className="btn btn-primary">
              Xem danh sách phòng trống
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="content-header">
        <div className="page-title">
          <h1>Cổng Thông Tin Khách Thuê</h1>
          <p>Xem thông tin phòng ở, hóa đơn điện nước và thực hiện thanh toán.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }}>
        {/* Left Side: Invoice history */}
        <div>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-primary)" />
              Lịch Sử Hóa Đơn Điện Nước
            </h2>

            {myInvoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                Chưa có hóa đơn nào được lập cho phòng của bạn!
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Kỳ Hóa Đơn</th>
                      <th>Tiền Phòng</th>
                      <th>Điện Nước</th>
                      <th>Tổng Cộng</th>
                      <th>Trạng Thái</th>
                      <th style={{ textAlign: 'right' }}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myInvoices.map(inv => {
                      const elecCost = (inv.elec_new - inv.elec_old) * inv.electricity_rate
                      const waterCost = (inv.water_new - inv.water_old) * inv.water_rate
                      const utilitiesCost = elecCost + waterCost

                      return (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: '600' }}>Tháng {inv.month}/{inv.year}</td>
                          <td>{inv.room_price.toLocaleString('vi-VN')} đ</td>
                          <td>{utilitiesCost.toLocaleString('vi-VN')} đ</td>
                          <td style={{ fontWeight: '700', color: 'var(--danger)' }}>
                            {inv.total.toLocaleString('vi-VN')} đ
                          </td>
                          <td>
                            {inv.is_paid ? (
                              <span className="badge badge-vacant">Đã thanh toán</span>
                            ) : (
                              <span className="badge badge-occupied" style={{ background: '#fef2f2', color: 'var(--danger)', borderColor: 'rgba(211,47,47,0.2)' }}>
                                Chưa thanh toán
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              Xem biên lai
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Room & Contract summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Room Photo Card */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <img 
              src={myRoom.image_url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'} 
              alt={`Phòng ${myRoom.room_number}`} 
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                Phòng trọ số: P.{myRoom.room_number}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
                Hợp đồng đang hoạt động • Diện tích 30m²
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Giá thuê phòng:</span>
                  <span style={{ fontWeight: '700', color: 'var(--danger)' }}>{myRoom.price.toLocaleString('vi-VN')} đ/tháng</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Đơn giá điện:</span>
                  <span style={{ fontWeight: '600' }}>{myRoom.electricity_rate.toLocaleString('vi-VN')} đ/kWh</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Đơn giá nước:</span>
                  <span style={{ fontWeight: '600' }}>{myRoom.water_rate.toLocaleString('vi-VN')} đ/m³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contract detail card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--accent-primary)" />
              Thông Tin Hợp Đồng
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Người thuê phòng:</span>
                <span style={{ fontWeight: '600' }}>{user.name}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Số điện thoại:</span>
                <span style={{ fontWeight: '600' }}>{user.phone}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Thông báo thanh toán:</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Vui lòng chuyển khoản tiền phòng trọ và dịch vụ theo số tài khoản của chủ nhà trước ngày 5 hàng tháng.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice receipt modal dialog */}
      {selectedInvoice && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Biên Lai Hóa Đơn</h2>
              <button 
                className="modal-close" 
                onClick={() => setSelectedInvoice(null)}
              >
                &times;
              </button>
            </div>
            
            <div id="printArea">
              <Receipt invoice={selectedInvoice} />
            </div>

            <div className="modal-footer" style={{ marginTop: '16px', paddingTop: '12px' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => window.print()}
                style={{ flex: 1 }}
              >
                In hóa đơn / Tải PDF
              </button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => setSelectedInvoice(null)}
                style={{ flex: 1 }}
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
