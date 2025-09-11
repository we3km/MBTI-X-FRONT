import React, { useState } from "react";
import styles from "./CreateGameRoom.module.css";
import { store } from "../../../../store/store";
import api from "../../../../api/mainPageApi"
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface ModalProps {
    onClose: () => void;
    onCreate: (title: string) => void;
}

type CreateRoomInput = {
    title: string;
    userId: number;
};

const CreateGameRoom: React.FC<ModalProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    // const userId = useSelector((state: RootState) => state.auth.userId);
    const getUserId = () => store.getState().auth.user?.userId;
    const userId = getUserId();
    console.log("현재 로그인한 회원 번호 : ", userId);
    // 게임방 생성용 mutation
    const createRoomMutation = useMutation({
        mutationFn: (data: CreateRoomInput) =>
            api.post("/createGameRoom", data).then(res => res.data),
        onSuccess: (data) => {
            console.log("생성하는 게임방 번호 :", data);
            setTitle("");
            onClose();
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
            createRoomMutation.mutate({ title, userId });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    X
                </button>
                <div className={styles.inputWrapper}>
                    <label className={styles.label}>제목 :</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={title}
                        placeholder="게임방 제목 입력"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <button className={styles.createBtn} onClick={handleCreate}>
                    생성하기
                </button>
            </div>
        </div>
    );
};

export default CreateGameRoom;
