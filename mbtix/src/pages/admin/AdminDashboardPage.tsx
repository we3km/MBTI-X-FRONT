import React, { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient'
import './AdminDashboard.css';

interface DashboardStats {
    newUsersToday: number;
    pendingInquiries: number;
    pendingReports: number;
    totalUsers: number;
}

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        apiClient.get('/admin/dashboard/stats')
            .then(response => {
                setStats(response.data);
            })
            .catch(error => {
                console.error("대시보드 통계 데이터 로딩 실패:", error);
            });
    }, []);

    return (
        <div className="admin-dashboard-container">
            <h1 className="dashboard-title">관리자 페이지</h1>
            <div className="dashboard-menu-box">
                <div className="dashboard-menu-item" onClick={() => navigate('/admin/users')}>
                    <div className="dashboard-icon">👥</div>
                    <h3>회원 내역 관리</h3>
                    <div className="menu-stat-label">
                        금일 가입 회원: <span className="stat-number">{stats ? stats.newUsersToday : '...'}</span>명
                    </div>
                </div>
                <div className="dashboard-menu-item" onClick={() => navigate('/admin/reports')}>
                    <div className="dashboard-icon">🚨</div>
                    <h3>신고 내역 관리</h3>
                    {stats && stats.pendingReports > 0 && (
                        <div className="menu-stat-badge danger">{stats.pendingReports}</div>
                    )}
                </div>
                <div className="dashboard-menu-item" onClick={() => navigate('/admin/inquiries')}>
                    <div className="dashboard-icon">💬</div>
                    <h3>1:1 문의 내역</h3>
                    {stats && stats.pendingInquiries > 0 && (
                        <div className="menu-stat-badge">{stats.pendingInquiries}</div>
                    )}
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