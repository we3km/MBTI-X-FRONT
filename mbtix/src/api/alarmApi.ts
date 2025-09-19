import apiClient from "./apiClient";

export interface Alarm {
    alarmId: number;
    receiverId: number;
    content: string;
    refId: number;
    type: string;
    createdAt: string;
    isRead: 'Y' | 'N';
}

export const getMyAlarms = async (): Promise<Alarm[]> => {
    const response = await apiClient.get('/alarms');
    return response.data;
};

export const markAlarmAsRead = async (alarmId: number): Promise<void> => {
    await apiClient.patch(`/alarms/${alarmId}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
    await apiClient.patch('/alarms/read-all');
};

export const deleteAllAlarms = async (): Promise<void> => {
    await apiClient.delete('/alarms/all');
};