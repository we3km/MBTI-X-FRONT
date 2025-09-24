import { useEffect, useState } from 'react';
import styles from './AdminQuizUpdate.module.css';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';

interface SpeedQuiz {
    questionId: number;
    question: string;
    answer: string;
}

interface CatchMind {
    wordId: number;
    word: string;
    createdAt: Date;
}

const AdminQuizUpdate = () => {
    const [speedQuizList, setSpeedQuizList] = useState<SpeedQuiz[]>([]);
    const [catchMindList, setCatchMindList] = useState<CatchMind[]>([]);

    const [speedQuizPage, setSpeedQuizPage] = useState(1);
    const [catchMindPage, setCatchMindPage] = useState(1);

    const itemsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const speedRes = await apiClient.get('/admin/selectAllSpeedQuiz');
                setSpeedQuizList(speedRes.data);

                const catchRes = await apiClient.get('/admin/selectAllCatchMindWords');
                setCatchMindList(catchRes.data);
            } catch (error) {
                console.error('데이터 불러오기 실패:', error);
                toast.error("데이터를 불러오는데 실패했습니다.");
            }
        };
        fetchData();
    }, []);

    // 수정 처리
    const handleSpeedQuizChange = (questionId: number, field: 'question' | 'answer', value: string) => {
        setSpeedQuizList(prev =>
            prev.map(item => item.questionId === questionId ? { ...item, [field]: value } : item)
        );
    };

    const handleCatchMindChange = (wordId: number, value: string) => {
        setCatchMindList(prev =>
            prev.map(item => item.wordId === wordId ? { ...item, word: value } : item)
        );
    };

    const handleSpeedQuizUpdate = async (item: SpeedQuiz) => {
        try {
            await apiClient.patch(`/admin/updateSpeedQuiz`, item);
            toast.success("스피드 퀴즈가 수정되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("수정 실패");
        }
    };

    const handleCatchMindUpdate = async (item: CatchMind) => {
        try {
            await apiClient.patch(`/admin/updateCatchMindWord`, item);
            toast.success("캐치마인드가 수정되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("수정 실패");
        }
    };

    // 삭제 처리
    const handleSpeedQuizDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/deleteSpeedQuiz`, { data: { id } });
            setSpeedQuizList(prev => prev.filter(item => item.questionId !== id));
            toast.success("스피드 퀴즈가 삭제되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("삭제 실패");
        }
    };

    const handleCatchMindDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/deleteCatchMindWord`, { data: { id } });
            setCatchMindList(prev => prev.filter(item => item.wordId !== id));
            toast.success("캐치마인드가 삭제되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("삭제 실패");
        }
    };

    // 페이지네이션 계산
    const speedQuizTotalPages = Math.ceil(speedQuizList.length / itemsPerPage);
    const catchMindTotalPages = Math.ceil(catchMindList.length / itemsPerPage);

    const speedQuizPageList = speedQuizList.slice(
        (speedQuizPage - 1) * itemsPerPage,
        speedQuizPage * itemsPerPage
    );

    const catchMindPageList = catchMindList.slice(
        (catchMindPage - 1) * itemsPerPage,
        catchMindPage * itemsPerPage
    );

    // 페이징 처리
    const renderPagination = (
        totalPages: number,
        currentPage: number,
        setPage: React.Dispatch<React.SetStateAction<number>>
    ) => {
        const maxPageButtons = 5;
        const startPage = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
        const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

        return (
            <div className={styles.pagination}>
                <button
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                >
                    이전
                </button>

                {Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index).map(
                    (page) => (
                        <button
                            key={page}
                            className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ""}`}
                            onClick={() => setPage(page)}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                >
                    다음
                </button>
            </div>
        );
    };
    return (
        <div className={styles.container}>
            <div className={styles.contentBox}>
                <button
                    className={styles.closeButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate("/miniGame");
                    }}
                >
                    <img src="/icons/exit.png" alt="Close" />
                </button>
                <h1 className={styles.title}>게임 데이터 관리 및 삭제</h1>

                {/* 스피드 퀴즈 */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>스피드 퀴즈</h2>
                    {speedQuizPageList.map((item) => (
                        <div key={item.questionId} className={styles.listItem}>
                            <input
                                value={item.question}
                                onChange={(e) =>
                                    handleSpeedQuizChange(item.questionId, "question", e.target.value)
                                }
                            />
                            <input
                                value={item.answer}
                                onChange={(e) =>
                                    handleSpeedQuizChange(item.questionId, "answer", e.target.value)
                                }
                            />
                            <button onClick={() => handleSpeedQuizUpdate(item)}>수정</button>
                            <button onClick={() => handleSpeedQuizDelete(item.questionId)}>삭제</button>
                        </div>
                    ))}
                    {renderPagination(speedQuizTotalPages, speedQuizPage, setSpeedQuizPage)}
                </section>

                {/* 캐치마인드 */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>캐치마인드</h2>
                    {catchMindPageList.map((item) => (
                        <div key={item.wordId} className={styles.listItem}>
                            <input
                                value={item.word}
                                onChange={(e) => handleCatchMindChange(item.wordId, e.target.value)}
                            />
                            <button onClick={() => handleCatchMindUpdate(item)}>수정</button>
                            <button onClick={() => handleCatchMindDelete(item.wordId)}>삭제</button>
                        </div>
                    ))}
                    {renderPagination(catchMindTotalPages, catchMindPage, setCatchMindPage)}
                </section>
            </div>
        </div>
    );
}
export default AdminQuizUpdate;
