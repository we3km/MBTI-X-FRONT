import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { type PageInfo } from '../type/logintype';
import Pagination from './Pagination';
import { useNavigate } from 'react-router-dom';

interface BoardComment {
    commentId: number;
    boardId: number;
    content: string;
    createAt: string;
}

interface Props {
    userId: number;
}

const UserCommentList: React.FC<Props> = ({ userId }) => {
    const [comments, setComments] = useState<BoardComment[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await apiClient.get(`/admin/users/${userId}/comments`, {
                    params: { cpage: currentPage }
                });
                setComments(response.data.list);
                setPageInfo(response.data.pi);
            } catch (error) {
                console.error("작성한 댓글 목록을 불러오는 중 에러 발생:", error);
            }
        };
        fetchComments();
    }, [userId, currentPage]);

    const handleRowClick = (boardId: number, commentId: number) => {

        window.open(`/board/${boardId}#comment-${commentId}`, '_blank');
    };

    if (comments.length === 0) {
        return <div className="placeholder-content">작성한 댓글이 없습니다.</div>;
    }

    return (
        <div>
            <table className="admin-table activity-table">
                <thead>
                    <tr>
                        <th>댓글번호</th>
                        <th>원본 게시글</th>
                        <th>내용</th>
                        <th>작성일</th>
                    </tr>
                </thead>
                <tbody>
                    {comments.map((comment) => (
                        <tr key={comment.commentId} onClick={() => handleRowClick(comment.boardId, comment.commentId)} className="clickable-row">
                            <td>{comment.commentId}</td>
                            <td>{comment.boardId}</td>
                            <td className="activity-title">{comment.content}</td>
                            <td>{new Date(comment.createAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {pageInfo && <Pagination pi={pageInfo} onPageChange={setCurrentPage} />}
        </div>
    );
};

export default UserCommentList;