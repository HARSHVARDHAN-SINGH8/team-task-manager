import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const TaskDetail = () => {
  const { id, taskId } = useParams();
  const { user } = useContext(AuthContext);
  const { showToast } = useNotification();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTaskAndComments = async () => {
    try {
      const [tasksRes, commentsRes] = await Promise.all([
        api.get(`/tasks/project/${id}`),
        api.get(`/comments/task/${taskId}`)
      ]);
      const currentTask = tasksRes.data.find(t => t.id.toString() === taskId);
      setTask(currentTask);
      setComments(commentsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskAndComments();
  }, [id, taskId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/comments/task/${taskId}`, { comment: newComment });
      setNewComment('');
      fetchTaskAndComments();
    } catch (error) {
      showToast('Error adding comment', 'error');
    }
  };

  if (loading) return <div>Loading task details...</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link to={`/projects/${id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition">
        <ArrowLeft size={16} /> Back to Project
      </Link>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
          <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${
            task.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            task.status === 'inprogress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {task.status === 'inprogress' ? 'In Progress' : task.status}
          </span>
        </div>
        <div className="mt-4 prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block">Priority</span>
            <span className="font-medium capitalize">{task.priority}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Due Date</span>
            <span className="font-medium">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Assigned To</span>
            <span className="font-medium">{task.assigned_to ? `User ID: ${task.assigned_to}` : 'Unassigned'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare size={20} /> Comments
        </h2>
        
        <form onSubmit={handleAddComment} className="mb-6 flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-grow px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
            <Send size={16} /> Send
          </button>
        </form>

        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">{comment.user_name}</span>
                <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{comment.comment}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-4">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
