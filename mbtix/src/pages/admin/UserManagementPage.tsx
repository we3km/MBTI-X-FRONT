import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import './UserManagementPage.css';
import { useNavigate } from 'react-router-dom';
import { type UserEntity, type PageInfo } from '../../type/logintype';
import Pagination from '../../components/Pagination';

const UserManagementPage = () => {
    const [userList, setUserList] = useState<UserEntity[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        // currentPage가 바뀔 때마다 API를 호출합니다.
        apiClient.get(`/admin/users?cpage=${currentPage}`)
            .then(response => {
                // 받아온 새로운 목록(response.data.list)으로 userList를 완전히 교체합니다.
                setUserList(response.data.list);
                setPageInfo(response.data.pi);
            })
            .catch(error => {
                console.error("회원 목록을 불러오는 중 에러 발생:", error);
            });
    }, [currentPage]);

    const handleRowClick = (userId: number) => {
        navigate(`/admin/users/${userId}`);
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="page-icon">👥</div>
                <h1>회원 내역 관리</h1>
            </div>
            
            <div className="table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>NO</th>
                            <th>아이디</th>
                            <th>닉네임</th>
                            <th>이메일</th>
                            <th>가입일</th>
                            <th>상태</th>
                            <th>제재 종료일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userList.map((user: UserEntity) => (
                            <tr key={user.userId} onClick={() => handleRowClick(user.userId)} className="clickable-row">
                                <td>{user.userId}</td>
                                <td>{user.loginId}</td>
                                <td>{user.nickname}</td>
                                <td>{user.email}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>{user.statusName}</td>
                                <td>{user.relesaeDate ? new Date(user.relesaeDate).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pageInfo && <Pagination pi={pageInfo} onPageChange={setCurrentPage} />}
        </div>
    );
};

export default UserManagementPage;