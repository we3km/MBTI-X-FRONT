import React, { useState } from "react";
import styles from "./CreateGameRoom.module.css";
import { store } from "../../../../store/store";
import api from "../../../../api/mainPageApi"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface ModalProps {
    onClose: () => void;
}

type CreateRoomInput = {
    title: string;
    userId: number;
    maxPlayers: number;
};

const CreateGameRoom: React.FC<ModalProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [maxPlayers, setMaxPlayers] = useState(5); // 기본 5명

    const getUserId = () => store.getState().auth.user?.userId;
    const userId = getUserId();
    const queryClient = useQueryClient();

    const createRoomMutation = useMutation({
        mutationFn: (data: CreateRoomInput) =>
            api.post("/createGameRoom", data).then(res => res.data),
        onSuccess: async (data) => {
            console.log("생성하는 게임방 번호 :", data);
            setTitle("");
            onClose();
            await queryClient.invalidateQueries({ queryKey: ['gamingRoomList'] });
            navigate(`/miniGame/CatchMind/${data}`);
        },
        onError: (err: Error) => {
            console.error("생성 실패ㅠㅠ:", err.message);
        },
    });
    const handleCreate = () => {
        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }
        if (userId == null) {
            alert("로그인이 필요합니다!",);
            return;
        }
        if (userId !== null || typeof (userId) !== undefined)
            createRoomMutation.mutate({ title, userId, maxPlayers });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    X
                </button>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        className={styles.input}
                        value={title}
                        placeholder="게임방 제목 입력"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                {/* 인원수 제한 입력 */}
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        className={styles.input}
                        value={maxPlayers}
                        min={2}
                        max={5}
                        onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    />
                    <span className={styles.label}>최대 인원수</span>
                </div>
                <button className={styles.createBtn} onClick={
                    handleCreate}>
                    생성하기
                </button>
            </div>
        </div>
    );
};

export default CreateGameRoom;
