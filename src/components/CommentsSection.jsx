import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MarkdownEditor from './MarkdownEditor';
import ReactMarkdown from 'react-markdown';

function CommentsSection({ itemId, inventoryId, hasWriteAccess }) {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const endpointUrl = itemId
    ? `/comments/item/${itemId}`
    : `/comments/inventory/${inventoryId}`;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(endpointUrl);
        setComments([...response.data].reverse());
      } catch (err) {
        setError('Failed to fetch comments.');
      } finally {
        setLoading(false);
      }
    };
    if (itemId || inventoryId) {
      fetchComments();
    }
  }, [endpointUrl, itemId, inventoryId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      return;
    }
    if (!user) {
      alert('You must be logged in to add a comment.');
      return;
    }
    try {
      const response = await api.post(endpointUrl, { text: newCommentText });
      setComments([...comments, response.data]);
      setNewCommentText('');
    } catch (err) {
      setError('Failed to add comment.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md my-6">
      <h2 className="text-2xl font-bold mb-4">
        {itemId ? 'Item Comments' : 'Inventory Comments'}
      </h2>
      {loading && <p>Loading comments...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-2 last:border-b-0">
            <p className="font-semibold text-blue-600 hover:text-blue-800 transition duration-300">
              <Link to={`/?author=${encodeURIComponent(comment.user.name)}`}>
                {comment.user.name}
              </Link>
            </p>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{comment.text}</ReactMarkdown>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(comment.createdAt).toLocaleDateString()} в {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
      </div>
      {hasWriteAccess && user && (
        <form onSubmit={handleAddComment} className="mt-4">
          <MarkdownEditor
            value={newCommentText}
            onChange={setNewCommentText}
            placeholder="Add a comment..."
            rows={4}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}

export default CommentsSection;