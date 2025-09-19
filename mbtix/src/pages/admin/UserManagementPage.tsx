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
    const [searchType, setSearchType] = useState('nickname');
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('all');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const params = new URLSearchParams({
                    cpage: String(currentPage),
                    status: status === 'all' ? '' : status,
                    searchType: keyword ? searchType : '',
                    keyword: keyword,
                });

                const response = await apiClient.get(`/admin/users?${params.toString()}`);
                setUserList(response.data.list);
                setPageInfo(response.data.pi);
            } catch (error) {
                console.error("회원 목록을 불러오는 중 에러 발생:", error);
            }
        };

        fetchUsers();
    }, [currentPage, keyword, status, searchType]);

    const handleRowClick = (userId: number) => {
        navigate(`/admin/users/${userId}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const searchInput = (document.getElementById('searchInput') as HTMLInputElement).value;
        setCurrentPage(1);
        setKeyword(searchInput);
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="page-icon">👥</div>
                <h1>회원 내역 관리</h1>
                <p className="total-users-count">
                    {pageInfo ? `총 ${pageInfo.listCount}명의 회원이 있습니다.` : '회원을 불러오는 중...'}
                </p>
            </div>

            <div className="search-filter-box">
                <select className="filter-select" value={status} onChange={e => { setCurrentPage(1); setStatus(e.target.value); }}>
                    <option value="all">전체</option>
                    <option value="active">활동중</option>
                    <option value="banned">정지</option>
                    <option value="withdrawn">탈퇴</option>
                </select>
                <form className="search-form" onSubmit={handleSearch}>
                    <select value={searchType} onChange={e => setSearchType(e.target.value)}>
                        <option value="nickname">닉네임</option>
                        <option value="loginId">아이디</option>
                    </select>
                    <input type="text" id="searchInput" placeholder="검색어 입력..." />
                    <button type="submit">검색</button>
                </form>
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
                                <td>{user.statusName === '정지' && user.relesaeDate ? new Date(user.relesaeDate).toLocaleDateString() : '-'}</td>
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