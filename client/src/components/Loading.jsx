import React from 'react';
import './css/Loading.css';
import Spinner from 'react-bootstrap/Spinner';

const Loading = () => {
    return (
        <div className="loading">
            <Spinner
                animation="border"
                size="lg"
                role="status"
                aria-hidden="true"
                variant="warning"
            />
        </div>
    );
};

export default Loading;
