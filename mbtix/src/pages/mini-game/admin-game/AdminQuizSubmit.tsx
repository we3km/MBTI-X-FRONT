import React, { useState } from 'react';
import styles from './AdminQuizSubmit.module.css';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';

const AdminQuizSubmit = () => {
    // 스피드 퀴즈 입력값을 위한 state
    const [speedQuizProblem, setSpeedQuizProblem] = useState('');
    const [speedQuizAnswer, setSpeedQuizAnswer] = useState('');

    // 캐치마인드 입력값을 위한 state
    const [catchMindWord, setCatchMindWord] = useState('');

    const navigate = useNavigate();

    // 스피드 퀴즈 제출 처리 함수
    const handleSpeedQuizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!speedQuizProblem.trim() || !speedQuizAnswer.trim()) {
            alert('스피드 퀴즈의 문제와 정답을 모두 입력해주세요.');
            return;
        }
        try {
            const quizData = {
                type: "speedQuiz",
                question: speedQuizProblem,
                answer: speedQuizAnswer
            };
            await apiClient.post('/admin/insertGameData', quizData);
            alert('스피드 퀴즈 문제가 성공적으로 제출되었습니다.');
            setSpeedQuizProblem('');
            setSpeedQuizAnswer('');
        } catch (error) {
            console.error('스피드 퀴즈 제출 실패:', error);
            alert('제출에 실패했습니다.');
        }
    };

    // 캐치마인드 문제 제출 처리 함수
    const handleCatchMindSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catchMindWord.trim()) {
            alert('캐치마인드 단어를 입력해주세요.');
            return;
        }
        try {
            const wordData = {
                word: catchMindWord,
                type: "catchMind"
            };
            await apiClient.post('/admin/insertGameData', wordData);
            alert('캐치마인드 단어가 성공적으로 제출되었습니다.');
            setCatchMindWord('');
        } catch (error) {
            console.error('캐치마인드 단어 제출 실패:', error);
            alert('제출에 실패했습니다.');
        }
    };
    return (
        <div className={styles.container}>
            <div className={styles.contentBox}>
                <button className={styles.closeButton} onClick={(e) => {
                    e.stopPropagation();
                    navigate("/miniGame"); // 메인 페이지 이동
                }}>
                    <img src="/icons/exit.png" alt="Close" />
                </button>
                <h1 className={styles.title}>문제 DB 저장</h1>

                {/* 스피드 퀴즈 폼 */}
                <form className={styles.formSection} onSubmit={handleSpeedQuizSubmit}>
                    <h2 className={styles.sectionTitle}>스피드 퀴즈</h2>
                    <input
                        type="text"
                        className={styles.inputField}
                        placeholder="문제 (ex. 대한민국의 수도는?)"
                        value={speedQuizProblem}
                        onChange={(e) => setSpeedQuizProblem(e.target.value)}
                    />
                    <input
                        type="text"
                        className={styles.inputField}
                        placeholder="정답 (ex. 서울)"
                        value={speedQuizAnswer}
                        onChange={(e) => setSpeedQuizAnswer(e.target.value)}
                    />
                    <button type="submit" className={styles.submitButton}>
                        스피드 퀴즈 제출
                    </button>
                </form>

                {/* 캐치마인드 폼 */}
                <form className={styles.formSection} onSubmit={handleCatchMindSubmit}>
                    <h2 className={styles.sectionTitle}>캐치마인드</h2>
                    <input
                        type="text"
                        className={styles.inputField}
                        placeholder="아무 단어 (ex. 코끼리)"
                        value={catchMindWord}
                        onChange={(e) => setCatchMindWord(e.target.value)}
                    />
                    <button type="submit" className={styles.submitButton}>
                        캐치마인드 문제 제출
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminQuizSubmit;