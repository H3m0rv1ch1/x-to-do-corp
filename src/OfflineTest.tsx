import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useAppContext } from './hooks/useAppContext';

const OfflineTest: React.FC = () => {
    const { signupLocal, loginLocal, user, logout } = useAuth();
    const { addToast } = useAppContext();
    const [status, setStatus] = useState<string>('Idle');

    const runTest = async () => {
        setStatus('Starting Test...');
        try {
            // 1. Logout if logged in
            if (user) {
                setStatus('Logging out...');
                await logout();
            }

            // 2. Create random offline user
            const randomId = Math.floor(Math.random() * 10000);
            const email = `offline${randomId}@test.com`;
            const password = 'password123';
            const name = `Offline User ${randomId}`;

            setStatus(`Creating user: ${email}...`);
            await signupLocal(name, email, password);
            setStatus('User created locally.');

            // 3. Verify user is logged in
            // signupLocal should auto-login
            // But let's logout and login again to be sure
            setStatus('Logging out to test login...');
            await logout();

            setStatus(`Logging in as ${email}...`);
            // @ts-ignore
            const { loginLocal: loginLocalFn } = useAuth(); // Re-get from hook to ensure latest context
            await loginLocalFn(email, password);

            setStatus('Login successful! Test Passed.');
            addToast('Offline Auth Test Passed!', 'success');

        } catch (error: any) {
            setStatus(`Test Failed: ${error.message}`);
            console.error(error);
            addToast(`Test Failed: ${error.message}`, 'error');
        }
    };

    return (
        <div className="p-4 border rounded m-4 bg-gray-800 text-white">
            <h2 className="text-xl font-bold mb-2">Offline Auth Test</h2>
            <p className="mb-2">Status: {status}</p>
            {user && <p className="mb-2 text-green-400">Current User: {user.email} ({user.isOfflineOnly ? 'Offline' : 'Online'})</p>}
            <button
                onClick={runTest}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
                Run Test
            </button>
        </div>
    );
};

export default OfflineTest;
