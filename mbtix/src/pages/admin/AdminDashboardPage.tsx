import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboardPage = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard-container">
            <h1 className="dashboard-title">관리자 페이지</h1>
            <div className="dashboard-menu-box">
                <div className="dashboard-menu-item" onClick={() => navigate('/admin/users')}>
                    <div className="dashboard-icon">👥</div>
                    <h3>회원 내역 관리</h3>
                </div>
                <div className="dashboard-menu-item" onClick={() => navigate('/admin/reports')}>
                    <div className="dashboard-icon">🚨</div>
                    <h3>신고 내역 관리</h3>
                </div>
                <div className="dashboard-menu-item" onClick={() => navigate('/admin/inquiries')}>
                    <div className="dashboard-icon">💬</div>
                    <h3>1:1 문의 내역</h3>
                </div>
                <div className="dashboard-menu-item" onClick={() => navigate('/admin/faqs')}>
                    <div className="dashboard-icon">❓</div>
                    <h3>FAQ 관리</h3>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;