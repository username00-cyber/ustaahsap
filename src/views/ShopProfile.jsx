import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Star, Box, Package, Check } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const hasOptions = product.options;
  const colors = hasOptions?.colors || [];
  const sizes = hasOptions?.sizes || [];

  const [selectedColor, setSelectedColor] = useState(colors[0] || null);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [amount, setAmount] = useState(1);

  const priceModifier = selectedSize?.priceOffset || 0;
  const finalPrice = product.price + priceModifier;

  const handleAdd = () => {
    onAddToCart(product, Number(amount), selectedColor, selectedSize);
    alert('Sepete eklendi!');
  };

  return (
    <div className="card p-0 overflow-hidden flex flex-col h-full">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-sm text-muted mb-4 flex-1">{product.description}</p>
        
        {/* Opsiyon Seçiciler */}
        {(colors.length > 0 || sizes.length > 0) && (
          <div className="mb-4 pt-4 border-t border-gray-100" style={{ borderColor: 'var(--border-color)'}}>
            {colors.length > 0 && (
              <div className="mb-3">
                <span className="text-xs font-bold text-muted block mb-1">
                  Renk Seçimi: {selectedColor?.name}
                </span>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => setSelectedColor(c)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor?.id === c.id ? 'border-primary scale-110' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: c.hex, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      title={c.name}
                    >
                      {selectedColor?.id === c.id && <Check size={14} color={c.hex === '#ffffff' ? '#000' : '#fff'}/>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {sizes.length > 0 && (
              <div>
                <span className="text-xs font-bold text-muted block mb-1">Ölçü / Boyut:</span>
                <select 
                  className="form-control py-1 px-2 text-sm" 
                  value={selectedSize?.id || ''}
                  onChange={e => setSelectedSize(sizes.find(s => s.id === e.target.value))}
                >
                  {sizes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.priceOffset > 0 ? `(+₺${s.priceOffset})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)'}}>
          <div className="flex justify-between items-center text-sm font-bold">
            <span>Fiyat:</span>
            <span className="text-lg text-success">₺{finalPrice} <span className="text-xs text-muted font-normal">/ {product.unit || 'Adet'}</span></span>
          </div>
          
          <div className="flex gap-2 w-full">
            <input 
              type="number" 
              className="form-control px-2 py-1 text-center font-bold" 
              style={{ width: '80px' }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
            />
            <button className="btn btn-primary flex-1 flex items-center justify-center gap-2 px-0" onClick={handleAdd}>
              <ShoppingCart size={16}/> {product.unit === 'm2' ? 'm² Ekle' : 'Sepete Ekle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopProfile = () => {
  const { id } = useParams();
  const { users, addToCart } = useAppContext();
  
  const shop = users.find(u => u.id === id && u.role === 'dukkan');

  if (!shop) return <Navigate to="/shops" />;

  return (
    <div className="container section">
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-24 h-24 bg-secondary text-white rounded-lg flex items-center justify-center">
             <Package size={48} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{shop.name}</h1>
            <p className="text-muted mt-2">{shop.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
              <span className="badge badge-pending flex items-center gap-1">
                <Star size={14} fill="currentColor" /> {shop.rating} Mağaza Puanı
              </span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Box size={24}/> Ürünler & Malzemeler</h2>
      
      {shop.products && shop.products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shop.products.map(prod => (
            <ProductCard key={prod.id} product={prod} onAddToCart={addToCart} />
          ))}
        </div>
      ) : (
        <p className="text-muted">Bu mağazada henüz ürün bulunmuyor.</p>
      )}
    </div>
  );
};

export default ShopProfile;
