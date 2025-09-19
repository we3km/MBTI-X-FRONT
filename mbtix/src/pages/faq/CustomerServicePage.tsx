import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Faq.css';

const CustomerServicePage = () => {
    const navigate = useNavigate();

    return (
        <div className="cs-container">
            <div className="cs-menu-box">
                <div className="cs-menu-item" onClick={() => navigate('/cs-inquiry')}>
                    <div className="cs-icon">✍️</div>
                    <h3>1:1 문의하기</h3>
                </div>

                <div className="cs-menu-item" onClick={() => navigate('/cs-history')}>
                    <div className="cs-icon">📂</div>
                    <h3>1:1 문의내역</h3>
                </div>
                
                <div className="cs-menu-item" onClick={() => navigate('/faqs')}>
                    <div className="cs-icon">❓</div>
                    <h3>FAQ</h3>
                </div>
            </div>
        </div>
    );
};

export default CustomerServicePage;