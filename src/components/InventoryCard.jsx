import React from 'react';
import { Link } from 'react-router-dom';
const CATEGORY_LABELS = {
  FURNITURE: 'Мебель',
  APPLIANCES: 'Техника',
  TRANSPORT: 'Транспорт',
  FOOD: 'Продукты питания',
  CHEMICALS: 'Химия',
  OTHER: 'Прочее',
};
function InventoryCard({ inventory }) { 
  const categoryLabel = CATEGORY_LABELS[inventory.category] || 'Неизвестная категория';
  return ( 
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {!inventory.isPublic && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
          Private
        </span>
      )}
      {inventory.imageUrl && ( 
        <img
          src={inventory.imageUrl}
          alt={inventory.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800">{inventory.title}</h3>
        <p className="text-gray-600 mt-2">Категория: <span className="font-medium text-gray-800">{categoryLabel}</span></p>
        <div className="mt-4 flex flex-wrap gap-2">
          {inventory.tags && inventory.tags.map((tag, index) => ( 
            <span key={index} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            by {inventory.createdBy.name}
          </p>
          <Link
            to={`/inventories/${inventory.id}`}
            className="text-blue-600 hover:underline"
          >
            View Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
export default InventoryCard;