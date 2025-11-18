import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Grid3x3, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';

interface Block {
  id: number;
  block_image?: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
}

interface BlockSet {
  id: number;
  name: string;
  blocks: Block[];
  created_at?: string;
  updated_at?: string;
}

export default function BlocksPage() {
  const [blockSets, setBlockSets] = useState<BlockSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [currentSetId, setCurrentSetId] = useState<number | null>(null);
  const [expandedSets, setExpandedSets] = useState<Set<number>>(new Set());
  const [blockFormData, setBlockFormData] = useState({
    block_image: null as File | null,
    title: '',
    description: '',
    button_text: '',
    button_link: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBlockSets();
  }, []);

  const loadBlockSets = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await httpClient.get('/api/hotspot/block-sets');
      // setBlockSets(data);
      setBlockSets([]);
    } catch (error) {
      console.error('Failed to load block sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetExpanded = (setId: number) => {
    const newExpandedSets = new Set(expandedSets);
    if (newExpandedSets.has(setId)) {
      newExpandedSets.delete(setId);
    } else {
      newExpandedSets.add(setId);
    }
    setExpandedSets(newExpandedSets);
  };

  const handleCreateBlockSet = async () => {
    try {
      const newSetNumber = blockSets.length + 1;
      const submitData = {
        name: `Block Set ${newSetNumber}`,
      };

      console.log('Creating block set:', submitData);
      
      // TODO: Backend API endpoint needs to be created
      // const newSet = await httpClient.post('/api/hotspot/block-sets', submitData);
      // setBlockSets([...blockSets, newSet]);
      // Auto-expand the new set
      // setExpandedSets(new Set([...expandedSets, newSet.id]));

      alert('✅ Block set created!\n\n⚠️ Backend API endpoint not yet created.\n\nData logged to console for development.');
    } catch (error) {
      console.error('Failed to create block set:', error);
      alert('Failed to create block set. Please try again.');
    }
  };

  const handleOpenBlockModal = (setId: number, block?: Block) => {
    setCurrentSetId(setId);
    if (block) {
      setEditingBlock(block);
      setBlockFormData({
        block_image: null,
        title: block.title,
        description: block.description,
        button_text: block.button_text,
        button_link: block.button_link,
      });
    } else {
      setEditingBlock(null);
      setBlockFormData({
        block_image: null,
        title: '',
        description: '',
        button_text: '',
        button_link: '',
      });
    }
    setIsBlockModalOpen(true);
  };

  const handleCloseBlockModal = () => {
    setIsBlockModalOpen(false);
    setEditingBlock(null);
    setCurrentSetId(null);
  };

  const handleSubmitBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData: any = {
        title: blockFormData.title,
        description: blockFormData.description,
        button_text: blockFormData.button_text,
        button_link: blockFormData.button_link,
        block_image: blockFormData.block_image ? blockFormData.block_image.name : undefined,
      };

      console.log('Block data prepared for set', currentSetId, ':', submitData);
      
      // TODO: Backend API endpoint needs to be created
      // if (editingBlock) {
      //   await httpClient.put(`/api/hotspot/block-sets/${currentSetId}/blocks/${editingBlock.id}`, submitData);
      // } else {
      //   await httpClient.post(`/api/hotspot/block-sets/${currentSetId}/blocks`, submitData);
      // }

      alert('✅ Form validated successfully!\n\n⚠️ Backend API endpoint not yet created.\n\nData logged to console for development.');

      handleCloseBlockModal();
    } catch (error) {
      console.error('Failed to save block:', error);
      alert('Failed to save block. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSet = async (id: number) => {
    if (!confirm('Are you sure you want to delete this block set? All blocks in this set will also be deleted.')) return;

    try {
      // TODO: Replace with actual API call
      // await httpClient.delete(`/api/hotspot/block-sets/${id}`);
      console.log('Deleting block set:', id);
      loadBlockSets();
    } catch (error) {
      console.error('Failed to delete block set:', error);
      alert('Failed to delete block set. Please try again.');
    }
  };

  const handleDeleteBlock = async (setId: number, blockId: number) => {
    if (!confirm('Are you sure you want to delete this block?')) return;

    try {
      // TODO: Replace with actual API call
      // await httpClient.delete(`/api/hotspot/block-sets/${setId}/blocks/${blockId}`);
      console.log('Deleting block:', blockId, 'from set:', setId);
      loadBlockSets();
    } catch (error) {
      console.error('Failed to delete block:', error);
      alert('Failed to delete block. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Block Sets</h1>
          <p className="text-sm text-gray-500 mt-1">Add multiple block sets for rotation - each set can contain multiple blocks</p>
        </div>
        <Button variant="primary" onClick={handleCreateBlockSet}>
          <Plus className="h-4 w-4 mr-2" />
          Add Block Set
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>Loading block sets...</p>
          </div>
        ) : blockSets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <Grid3x3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No block sets found. Click "Add Block Set" to create your first set.</p>
          </div>
        ) : (
          blockSets.map((blockSet, index) => (
            <div key={blockSet.id} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleSetExpanded(blockSet.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedSets.has(blockSet.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Block Set {index + 1}</h3>
                    <p className="text-sm text-gray-500">This set will rotate with other sets on the frontend</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenBlockModal(blockSet.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Block
                  </Button>
                  <button
                    onClick={() => handleDeleteSet(blockSet.id)}
                    className="text-red-600 hover:text-red-900 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedSets.has(blockSet.id) && (
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Blocks in this set</h4>
                  {blockSet.blocks.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-sm">No blocks in this set yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {blockSet.blocks.map((block, blockIndex) => (
                        <div key={block.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="text-sm font-semibold text-gray-900">Block {blockIndex + 1}</h5>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleOpenBlockModal(blockSet.id, block)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteBlock(blockSet.id, block.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {block.block_image ? (
                            <img
                              src={block.block_image}
                              alt={block.title}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <p className="text-sm font-medium text-gray-900 mb-1">{block.title || 'Untitled'}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{block.description || 'No description'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Block Modal */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={handleCloseBlockModal}
        title={`Block ${editingBlock ? '' : (blockSets.find(s => s.id === currentSetId)?.blocks.length || 0) + 1}`}
        size="lg"
      >
        <form onSubmit={handleSubmitBlock} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Block Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setBlockFormData({ ...blockFormData, block_image: e.target.files?.[0] || null })
              }
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <Input
            label="Title"
            required
            value={blockFormData.title}
            onChange={(e) => setBlockFormData({ ...blockFormData, title: e.target.value })}
            placeholder="Enter block title"
          />

          <Textarea
            label="Description"
            required
            value={blockFormData.description}
            onChange={(e) => setBlockFormData({ ...blockFormData, description: e.target.value })}
            placeholder="Enter block description"
            rows={3}
          />

          <Input
            label="Button Text"
            required
            value={blockFormData.button_text}
            onChange={(e) => setBlockFormData({ ...blockFormData, button_text: e.target.value })}
            placeholder="e.g., Learn More, Shop Now"
          />

          <Input
            label="Button Link"
            required
            value={blockFormData.button_link}
            onChange={(e) => setBlockFormData({ ...blockFormData, button_link: e.target.value })}
            placeholder="https://example.com"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseBlockModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingBlock ? 'Update' : 'Add'} Block
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
