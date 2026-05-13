'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Sparkles,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useImprovementStore, type Recommendation } from '@/lib/stores/improvement-store';

// --- Pre-defined feedback items for linking ---
const LINKABLE_FEEDBACK = [
  { id: 'fb-2', text: '3-day response time for urgent tickets', category: 'Response Time' },
  { id: 'fb-5', text: 'Hourly rate higher than competitors', category: 'Pricing' },
  { id: 'fb-6', text: 'Portal not screen-reader compatible', category: 'Accessibility' },
  { id: 'fb-8', text: 'New staff need more ticketing training', category: 'Training Needs' },
  { id: 'fb-10', text: 'Response time increased from 2h to 8h', category: 'Response Time' },
  { id: 'fb-14', text: 'Limited remote support options', category: 'Accessibility' },
  { id: 'fb-15', text: 'VPN drops during peak hours', category: 'Reliability' },
  { id: 'fb-16', text: 'Need cybersecurity workshops', category: 'Training Needs' },
];

const IMPACT_COLORS = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
};

const EFFORT_COLORS = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
};

interface RecommendationFormProps {
  onSuggest?: () => void;
}

export default function RecommendationForm({ onSuggest }: RecommendationFormProps) {
  const recommendations = useImprovementStore((s) => s.recommendations);
  const addRecommendation = useImprovementStore((s) => s.addRecommendation);
  const updateRecommendation = useImprovementStore((s) => s.updateRecommendation);
  const removeRecommendation = useImprovementStore((s) => s.removeRecommendation);
  const approveRecommendation = useImprovementStore((s) => s.approveRecommendation);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [rationale, setRationale] = useState('');
  const [linkedFeedback, setLinkedFeedback] = useState<string[]>([]);
  const [impact, setImpact] = useState<'high' | 'medium' | 'low'>('medium');
  const [effort, setEffort] = useState<'high' | 'medium' | 'low'>('medium');
  const [showLinked, setShowLinked] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setRationale('');
    setLinkedFeedback([]);
    setImpact('medium');
    setEffort('medium');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (editingId) {
      updateRecommendation(editingId, {
        title: title.trim(),
        description: description.trim(),
        impact,
        effort,
      });
    } else {
      addRecommendation({
        title: title.trim(),
        description: description.trim(),
        impact,
        effort,
      });
    }
    resetForm();
  };

  const handleEdit = (rec: Recommendation) => {
    setEditingId(rec.id);
    setTitle(rec.title);
    setDescription(rec.description);
    setImpact(rec.impact);
    setEffort(rec.effort);
    setShowForm(true);
  };

  const toggleLinkedFeedback = (fbId: string) => {
    setLinkedFeedback((prev) =>
      prev.includes(fbId) ? prev.filter((id) => id !== fbId) : [...prev, fbId],
    );
  };

  return (
    <div className="space-y-4">
      {/* Add button & AI suggest */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Recommendation
        </Button>
        {onSuggest && (
          <Button
            variant="outline"
            onClick={onSuggest}
            className="rounded-xl"
          >
            <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" />
            AI Suggest
          </Button>
        )}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="rounded-2xl border-2 border-amber-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  {editingId ? 'Edit Recommendation' : 'New Recommendation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rec-title" className="text-xs font-medium">Title *</Label>
                  <Input
                    id="rec-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Implement Priority Ticket Escalation"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rec-desc" className="text-xs font-medium">Description</Label>
                  <Textarea
                    id="rec-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the recommendation in detail..."
                    className="rounded-xl min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Impact</Label>
                    <Select value={impact} onValueChange={(v) => setImpact(v as 'high' | 'medium' | 'low')}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Impact</SelectItem>
                        <SelectItem value="medium">Medium Impact</SelectItem>
                        <SelectItem value="low">Low Impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Effort</Label>
                    <Select value={effort} onValueChange={(v) => setEffort(v as 'high' | 'medium' | 'low')}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Effort</SelectItem>
                        <SelectItem value="medium">Medium Effort</SelectItem>
                        <SelectItem value="low">Low Effort</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rec-rationale" className="text-xs font-medium">Rationale</Label>
                  <Textarea
                    id="rec-rationale"
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="Why is this recommendation important? What evidence supports it?"
                    className="rounded-xl min-h-[60px]"
                  />
                </div>

                {/* Linked feedback */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs p-2 h-auto"
                    onClick={() => setShowLinked(!showLinked)}
                  >
                    <span>Linked Feedback ({linkedFeedback.length})</span>
                    {showLinked ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                  <AnimatePresence>
                    {showLinked && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border rounded-xl p-2 space-y-1"
                      >
                        {LINKABLE_FEEDBACK.map((fb) => (
                          <label
                            key={fb.id}
                            className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              linkedFeedback.includes(fb.id) ? 'bg-amber-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={linkedFeedback.includes(fb.id)}
                              onChange={() => toggleLinkedFeedback(fb.id)}
                              className="mt-0.5 rounded accent-amber-500"
                            />
                            <div>
                              <p className="text-xs text-slate-700">{fb.text}</p>
                              <Badge variant="secondary" className="text-[9px] mt-0.5">{fb.category}</Badge>
                            </div>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={handleSubmit} disabled={!title.trim()} className="rounded-xl">
                    <Check className="h-4 w-4 mr-1.5" />
                    {editingId ? 'Update' : 'Add'}
                  </Button>
                  <Button variant="outline" onClick={resetForm} className="rounded-xl">
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations list */}
      {recommendations.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl">
          <Lightbulb className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No recommendations yet. Add one to get started!</p>
        </div>
      ) : (
        <ScrollArea className="max-h-96">
          <div className="space-y-3 pr-2">
            <AnimatePresence>
              {recommendations.map((rec) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  <Card className={`rounded-xl border shadow-sm py-0 gap-0 ${rec.approved ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-slate-800">{rec.title}</h4>
                            {rec.approved && (
                              <Badge className="text-[9px] bg-emerald-100 text-emerald-700">Approved</Badge>
                            )}
                          </div>
                          {rec.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 mb-2">{rec.description}</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-[9px] ${IMPACT_COLORS[rec.impact]}`}>
                              Impact: {rec.impact}
                            </Badge>
                            <Badge className={`text-[9px] ${EFFORT_COLORS[rec.effort]}`}>
                              Effort: {rec.effort}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!rec.approved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => approveRecommendation(rec.id)}
                              title="Approve"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEdit(rec)}
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => removeRecommendation(rec.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
