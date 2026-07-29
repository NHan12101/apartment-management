import React from 'react'

export default function Receipt({ invoice, onClose }) {
  if (!invoice) return null

  const roomTotal = invoice.room_price
  const elecCost = invoice.elec_usage * invoice.electricity_rate
  const waterCost = invoice.water_usage * invoice.water_rate

  return (
    <div className="modal-overlay active">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Hóa Đơn Tiền Phòng & Dịch Vụ</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div id="printArea">
          <div className="receipt-container">
            <div className="receipt-header">
              <h2 style={{ fontSize: '18px', transform: 'uppercase' }}>BIÊN LAI THANH TOÁN</h2>
              <p style={{ fontSize: '12px', marginTop: '5px' }}>Hóa Đơn Tháng {invoice.month}/{invoice.year}</p>
            </div>
            
            <div className="receipt-row">
              <span>Phòng:</span>
              <strong>{invoice.room_number || 'Phòng cũ'}</strong>
            </div>
            <div className="receipt-row">
              <span>Khách hàng:</span>
              <span>{invoice.tenant_name || 'Khách đã chuyển đi'}</span>
            </div>
            <div className="receipt-row" style={{ marginBottom: '15px' }}>
              <span>Trạng thái:</span>
              <strong style={{ color: invoice.is_paid ? '#059669' : '#dc2626' }}>
                {invoice.is_paid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
              </strong>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginBottom: '10px' }}>
              <strong>Chi tiết các dịch vụ:</strong>
            </div>

            <div className="receipt-row">
              <span>1. Tiền thuê phòng cơ bản:</span>
              <span>{roomTotal.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="receipt-row">
              <span>2. Tiền điện sử dụng:</span>
              <span>{elecCost.toLocaleString('vi-VN')} đ</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '15px', marginBottom: '6px' }}>
              (Chỉ số: {invoice.elec_old} kWh → {invoice.elec_new} kWh | Tiêu thụ: {invoice.elec_usage} kWh * Đơn giá: {invoice.electricity_rate.toLocaleString('vi-VN')}đ)
            </div>

            <div className="receipt-row">
              <span>3. Tiền nước sử dụng:</span>
              <span>{waterCost.toLocaleString('vi-VN')} đ</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '15px', marginBottom: '15px' }}>
              (Chỉ số: {invoice.water_old} m³ → {invoice.water_new} m³ | Tiêu thụ: {invoice.water_usage} m³ * Đơn giá: {invoice.water_rate.toLocaleString('vi-VN')}đ)
            </div>

            <div className="receipt-row total">
              <span>TỔNG TIỀN PHẢI TRẢ:</span>
              <span>{invoice.total.toLocaleString('vi-VN')} đ</span>
            </div>

            {invoice.is_paid && invoice.paid_date && (
              <div 
                style={{ 
                  marginTop: '20px', 
                  fontSize: '11px', 
                  textAlign: 'center', 
                  color: '#059669', 
                  fontWeight: 'bold', 
                  border: '1px solid #10b981', 
                  padding: '6px', 
                  borderRadius: '4px' 
                }}
              >
                Hóa đơn đã được thanh toán vào ngày {invoice.paid_date}
              </div>
            )}

            <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '11px', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '15px' }}>
              Cảm ơn bạn đã lựa chọn lưu trú tại Homestay Pro! <br />
              Mọi thắc mắc xin liên hệ quản lý để được giải quyết.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>In Hóa Đơn / PDF</button>
        </div>
      </div>
    </div>
  )
}
