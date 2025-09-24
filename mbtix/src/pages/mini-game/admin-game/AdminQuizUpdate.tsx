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
    createdAy: Date;
}

const AdminQuizUpdate = () => {
    const [speedQuizList, setSpeedQuizList] = useState<SpeedQuiz[]>([]);
    const [catchMindList, setCatchMindList] = useState<CatchMind[]>([]);
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
    const handleSpeedQuizChange = (qusetionId: number, field: 'question' | 'answer', value: string) => {
        setSpeedQuizList(prev =>
            prev.map(item => item.questionId === qusetionId ? { ...item, [field]: value } : item)
        );
    };

    const handleCatchMindChange = (wordId: number, value: string) => {
        setCatchMindList(prev =>
            prev.map(item => item.wordId === wordId ? { ...item, word: value } : item)
        );
    };

    const handleSpeedQuizUpdate = async (item: SpeedQuiz) => {
        try {
            await apiClient.patch(`/admin/updateGameData/${item.questionId}`, item);
            toast.success("스피드 퀴즈가 수정되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("수정 실패");
        }
    };

    const handleCatchMindUpdate = async (item: CatchMind) => {
        try {
            await apiClient.patch(`/admin/updateGameData/${item.wordId}`, item);
            toast.success("캐치마인드가 수정되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("수정 실패");
        }
    };

    // 삭제 처리
    const handleSpeedQuizDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/deleteGameData/${id}`);
            setSpeedQuizList(prev => prev.filter(item => item.questionId !== id));
            toast.success("삭제 성공");
        } catch (error) {
            console.error(error);
            toast.error("삭제 실패");
        }
    };

    const handleCatchMindDelete = async (id: number) => {
        try {
            await apiClient.delete(`/admin/deleteGameData/${id}`);
            setCatchMindList(prev => prev.filter(item => item.wordId !== id));
            toast.success("삭제 성공");
        } catch (error) {
            console.error(error);
            toast.error("삭제 실패");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentBox}>
                <button className={styles.closeButton} onClick={(e) => {
                    e.stopPropagation();
                    navigate("/miniGame");
                }}>
                    <img src="/icons/exit.png" alt="Close" />
                </button>
                <h1 className={styles.title}>문제 DB 관리</h1>

                {/* 스피드 퀴즈 리스트 */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>스피드 퀴즈</h2>
                    {speedQuizList.map(item => (
                        <div key={item.questionId} className={styles.listItem}>
                            <div>{item.questionId}</div>
                            <input
                                value={item.question}
                                onChange={(e) => handleSpeedQuizChange(item.questionId, 'question', e.target.value)}
                            />
                            <input
                                value={item.answer}
                                onChange={(e) => handleSpeedQuizChange(item.questionId, 'answer', e.target.value)}
                            />
                            <button onClick={() => handleSpeedQuizUpdate(item)}>수정</button>
                            <button onClick={() => handleSpeedQuizDelete(item.questionId)}>삭제</button>
                        </div>
                    ))}
                </section>

                {/* 캐치마인드 리스트 */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>캐치마인드</h2>
                    {catchMindList.map(item => (
                        <div key={item.wordId} className={styles.listItem}>
                            <div>{item.wordId}</div>
                            <input
                                value={item.word}
                                onChange={(e) => handleCatchMindChange(item.wordId, e.target.value)}
                            />
                            <button onClick={() => handleCatchMindUpdate(item)}>수정</button>
                            <button onClick={() => handleCatchMindDelete(item.wordId)}>삭제</button>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default AdminQuizUpdate;
