import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { type Board } from '../type/board';
import { type PageInfo } from '../type/logintype';
import Pagination from './Pagination';
import { useNavigate } from 'react-router-dom';

interface Props {
    userId: number;
}

const UserPostList: React.FC<Props> = ({ userId }) => {
    const [posts, setPosts] = useState<Board[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await apiClient.get(`/admin/users/${userId}/posts`, {
                    params: { cpage: currentPage }
                });
                setPosts(response.data.list);
                setPageInfo(response.data.pi);
            } catch (error) {
                console.error("작성한 게시글 목록을 불러오는 중 에러 발생:", error);
            }
        };
        fetchPosts();
    }, [userId, currentPage]);

    const handleRowClick = (boardId: number) => {
        window.open(`/board/${boardId}`, '_blank');
    };

    if (posts.length === 0) {
        return <div className="placeholder-content">작성한 게시글이 없습니다.</div>;
    }

    return (
        <div>
            <table className="admin-table activity-table">
                <thead>
                    <tr>
                        <th>글번호</th>
                        <th>제목</th>
                        <th>작성일</th>
                        <th>조회수</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.boardId} onClick={() => handleRowClick(post.boardId)} className="clickable-row">
                            <td>{post.boardId}</td>
                            <td className="activity-title">{post.title}</td>
                            <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                            <td>{post.view}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {pageInfo && <Pagination pi={pageInfo} onPageChange={setCurrentPage} />}
        </div>
    );
};

export default UserPostList;