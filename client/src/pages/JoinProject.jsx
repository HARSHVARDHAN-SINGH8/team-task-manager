import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Loader2, Users } from 'lucide-react';

const JoinProject = () => {
  const { token } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error, already
  const [message, setMessage] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If not logged in, redirect to login with return URL
    if (!user) {
      localStorage.setItem('pendingInvite', token);
      navigate('/login');
      return;
    }

    // Join the project
    const joinProject = async () => {
      try {
        const res = await api.post(`/projects/join/${token}`);
        setProjectId(res.data.projectId);
        setProjectName(res.data.projectName || 'the project');
        
        if (res.data.alreadyMember) {
          setStatus('already');
          setMessage('You are already a member of this project.');
        } else {
          setStatus('success');
          setMessage(res.data.message || 'Successfully joined!');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Invalid or expired invite link.');
      }
    };

    joinProject();
  }, [token, user, authLoading]);

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1e1f21]">
        <div className="text-center space-y-6 p-8">
          <div className="w-20 h-20 mx-auto bg-blue-600/10 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Joining Project...</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we process your invite.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1e1f21] p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#2b2d30] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-10 text-center space-y-6">
        
        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle size={44} className="text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Welcome!</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                You've successfully joined <span className="font-bold text-gray-900 dark:text-white">{projectName}</span>
              </p>
            </div>
            <button
              onClick={() => window.location.href = `/projects/${projectId}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Open Project
            </button>
          </>
        )}

        {status === 'already' && (
          <>
            <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center">
              <Users size={44} className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Already a Member</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{message}</p>
            </div>
            <button
              onClick={() => window.location.href = `/projects/${projectId}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Go to Project
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
              <XCircle size={44} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Invite Failed</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{message}</p>
            </div>
            <button
              onClick={() => window.location.href = '/home'}
              className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              Go to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinProject;
