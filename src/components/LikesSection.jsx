import React, { useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { FaHeart } from 'react-icons/fa';
function LikesSection({ itemId, likes = [], canEdit }) {
  const [itemLikes, setItemLikes] = useState(likes);
  const { token, user } = useAuth();
  const isLiked = itemLikes.some(like => like.userId === user?.id);
  const handleToggleLike = async () => {
    if (!user) {
      alert('You must be logged in to like an item.');
      return;
    }
    if (!canEdit) {
      return; 
    }
    try {
      await api.post(`/likes/${itemId}`, {});
      if (isLiked) {
        setItemLikes(itemLikes.filter(like => like.userId !== user.id));
      } else {
        setItemLikes([...itemLikes, { userId: user.id }]);
      }
    } catch (err) {
      alert('Failed to toggle like.');
    }
  };
  return (
    <div className="flex items-center space-x-2 my-4">
      {user ? (
        <button onClick={handleToggleLike} className={`text-xl ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
          <FaHeart />
       </button>
      ) : (
         <FaHeart className={`text-xl ${isLiked ? 'text-red-500' : 'text-gray-400'}`} />
       )}
      <span>{itemLikes.length} Likes</span>
    </div>
  );
}
export default LikesSection;