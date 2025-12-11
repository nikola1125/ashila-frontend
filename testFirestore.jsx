// TestFirestore.jsx - Deprecated
// This file was used for Firestore testing and is no longer needed
// All database operations now use the backend API

import { useEffect } from 'react';

const TestFirestore = () => {
    useEffect(() => {
        console.log('TestFirestore component is deprecated. Using backend API instead.');
    }, []);
            } catch (error) {
                console.error('Firestore connection failed:', error);
            }
        };

        testConnection();
    }, []);

    return <div>Check browser console for Firestore data...</div>;
};

export default TestFirestore;