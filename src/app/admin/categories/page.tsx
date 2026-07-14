'use client';

import React, { useState, useEffect } from 'react';
import { fetchAllCategories, createCategory, updateCategory, deleteCategory, Category } from '@/backend/categories';
import { useUIStore } from '@/store/uiStore';
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function AdminCategoriesPage() {
  const { showToast } = useUIStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('📱');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = async () => {
    const list = await fetchAllCategories();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showToast('Name and slug are required.', 'error');
      return;
    }

    if (editingId) {
      const res = await updateCategory(editingId, { name, slug, description, image });
      if (res.success) {
        showToast('Category updated successfully!', 'success');
        setEditingId(null);
      } else {
        showToast('Update failed.', 'error');
      }
    } else {
      const order = categories.length + 1;
      const res = await createCategory({ name, slug, description, image, enabled: true, order, featured: true });
      if (res.success) {
        showToast('Category created successfully!', 'success');
      } else {
        showToast('Creation failed.', 'error');
      }
    }

    setName('');
    setSlug('');
    setDescription('');
    setImage('📱');
    loadCategories();
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? '');
    setImage(cat.image ?? '📱');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const res = await deleteCategory(id);
      if (res.success) {
        showToast('Category deleted successfully.', 'success');
        loadCategories();
      } else {
        showToast('Delete failed.', 'error');
      }
    }
  };

  const moveOrder = async (idx: number, dir: 'up' | 'down') => {
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;

    const list = [...categories];
    const temp = list[idx].order;
    list[idx].order = list[newIdx].order;
    list[newIdx].order = temp;

    await updateCategory(list[idx].id, { order: list[idx].order });
    await updateCategory(list[newIdx].id, { order: list[newIdx].order });
    loadCategories();
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Categories Control</h1>
        <p className="text-xs text-zinc-550 font-mono mt-1 uppercase tracking-wider">Manage dynamic storefront catalogs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleCreateOrUpdate} className="lg:col-span-1 bg-black border border-zinc-900 p-6 rounded-2xl space-y-4 h-fit">
          <h2 className="text-xs font-bold uppercase tracking-wider text-light-gold">
            {editingId ? 'Edit Category Specifications' : 'Deploy New Category'}
          </h2>

          <Input label="Category Label" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smart Glasses" />
          <Input label="Catalog Slug" required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/ /g, '-'))} placeholder="e.g. smart-glasses" />
          <Input label="Icon / Emoji representation" required value={image} onChange={(e) => setImage(e.target.value)} placeholder="📱" />
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest font-bold">Catalog Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Futuristic holographic accessories"
              className="w-full bg-[#111] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none focus:border-light-gold transition-colors h-24"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="gold" size="sm" className="flex-1">
              {editingId ? 'Apply Update' : 'Initialize Catalog'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditingId(null); setName(''); setSlug(''); setDescription(''); setImage('📱'); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2 bg-black border border-zinc-900 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/60 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-4">Representation</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-350">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-zinc-950/40 transition-colors">
                  <td className="px-5 py-3 text-lg">{cat.image}</td>
                  <td className="px-5 py-3 font-semibold text-white">{cat.name}</td>
                  <td className="px-5 py-3 font-mono text-zinc-500">{cat.slug}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400">{cat.order}</span>
                      <div className="flex flex-col">
                        <button onClick={() => moveOrder(idx, 'up')} className="text-zinc-650 hover:text-light-gold transition-colors cursor-pointer"><ArrowUp size={10} /></button>
                        <button onClick={() => moveOrder(idx, 'down')} className="text-zinc-650 hover:text-light-gold transition-colors cursor-pointer"><ArrowDown size={10} /></button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(cat)} className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-light-gold hover:border-primary-gold/20 transition-all cursor-pointer"><Edit3 size={13} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
