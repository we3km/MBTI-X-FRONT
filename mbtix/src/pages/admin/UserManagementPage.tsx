import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import './UserManagementPage.css';

interface PageInfo {
    listCount: number;
    currentPage: number;
    pageLimit: number;
    boardLimit: number;
    maxPage: number;
    startPage: number;
    endPage: number;
}

interface UserEntity {
    userId: number;
    loginId: string;
    nickname: string;
    email: string;
    createdAt: string;
    statusName: string;
    releasaeDate: string | null;
}

const UserManagementPage = () => {
    const [userList, setUserList] = useState<UserEntity[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        apiClient.get(`/admin/users?cpage=${currentPage}`)
            .then(response => {
                setUserList(response.data.list);
                setPageInfo(response.data.pi);
})
            .catch(error => {
                console.error("회원 목록을 불러오는 중 에러 발생:", error);
            });
    }, [currentPage]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const pageButtons = [];
    if (pageInfo) {
        for (let i = pageInfo.startPage; i <= pageInfo.endPage; i++) {
            pageButtons.push(
                <button 
                    key={i} 
                    onClick={() => handlePageChange(i)}
                    className={i === pageInfo.currentPage ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }
    }

    return (
        <div className="user-management-container">
            <div className="page-icon">🔔</div>
            <h1>회원 내역 관리</h1>

            <table className="user-table">
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
                        <tr key={user.userId}>
                            <td>{user.userId}</td>
                            <td>{user.loginId}</td>
                            <td>{user.nickname}</td>
                            <td>{user.email}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>{user.statusName}</td> 
                            <td>{user.releasaeDate ? new Date(user.releasaeDate).toLocaleDateString() : '-'}</td> 
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={pageInfo?.currentPage === 1}
                >
                    &lt;
                </button>
                {pageButtons}
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={pageInfo?.currentPage === pageInfo?.maxPage}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default UserManagementPage;