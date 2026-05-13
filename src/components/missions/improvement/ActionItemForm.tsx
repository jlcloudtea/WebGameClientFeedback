'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  ListChecks,
  X,
} from 'lucide-react';
import { useImprovementStore, type ActionItem } from '@/lib/stores/improvement-store';

const STATUS_CONFIG = {
  pending: { label: 'Planned', color: 'bg-amber-100 text-amber-700', icon: Circle },
  'in-progress': { label: 'In Progress', color: 'bg-sky-100 text-sky-700', icon: Clock },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
};

export default function ActionItemForm() {
  const actionItems = useImprovementStore((s) => s.actionItems);
  const recommendations = useImprovementStore((s) => s.recommendations);
  const addActionItem = useImprovementStore((s) => s.addActionItem);
  const updateActionItem = useImprovementStore((s) => s.updateActionItem);
  const removeActionItem = useImprovementStore((s) => s.removeActionItem);

  const [showForm, setShowForm] = useState(false);
  const [task, setTask] = useState('');
  const [assignee, setAssignee] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ActionItem['status']>('pending');
  const [recommendationId, setRecommendationId] = useState('');

  const resetForm = () => {
    setTask('');
    setAssignee('');
    setDeadline('');
    setStatus('pending');
    setRecommendationId('');
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!task.trim()) return;
    addActionItem({
      recommendationId: recommendationId || 'none',
      task: task.trim(),
      assignee: assignee.trim() || 'Unassigned',
      deadline: deadline || 'TBD',
      status,
    });
    resetForm();
  };

  const toggleStatus = (item: ActionItem) => {
    const nextStatus: Record<ActionItem['status'], ActionItem['status']> = {
      pending: 'in-progress',
      'in-progress': 'completed',
      completed: 'pending',
    };
    updateActionItem(item.id, { status: nextStatus[item.status] });
  };

  const pendingCount = actionItems.filter((i) => i.status === 'pending').length;
  const inProgressCount = actionItems.filter((i) => i.status === 'in-progress').length;
  const completedCount = actionItems.filter((i) => i.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <Circle className="h-4 w-4 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-amber-700">{pendingCount}</p>
          <p className="text-[10px] text-amber-600">Planned</p>
        </div>
        <div className="bg-sky-50 rounded-xl p-3 text-center">
          <Clock className="h-4 w-4 text-sky-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-sky-700">{inProgressCount}</p>
          <p className="text-[10px] text-sky-600">In Progress</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-emerald-700">{completedCount}</p>
          <p className="text-[10px] text-emerald-600">Completed</p>
        </div>
      </div>

      {/* Add button */}
      <Button
        onClick={() => setShowForm(true)}
        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Action Item
      </Button>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="rounded-2xl border-2 border-amber-200 shadow-md py-0 gap-0">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="action-task" className="text-xs font-medium">Task *</Label>
                  <Input
                    id="action-task"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="e.g., Survey site for water damage to connection box"
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="action-owner" className="text-xs font-medium">Owner</Label>
                    <Input
                      id="action-owner"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="e.g., John Smith"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="action-deadline" className="text-xs font-medium">Deadline</Label>
                    <Input
                      id="action-deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as ActionItem['status'])}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Planned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Linked Recommendation</Label>
                    <Select value={recommendationId} onValueChange={setRecommendationId}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {recommendations.map((rec) => (
                          <SelectItem key={rec.id} value={rec.id}>
                            {rec.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button onClick={handleSubmit} disabled={!task.trim()} className="rounded-xl" size="sm">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                  <Button variant="outline" onClick={resetForm} className="rounded-xl" size="sm">
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action items list */}
      {actionItems.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl">
          <ListChecks className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No action items yet. Create an implementation plan!</p>
        </div>
      ) : (
        <ScrollArea className="max-h-96">
          <div className="space-y-2 pr-2">
            <AnimatePresence>
              {actionItems.map((item) => {
                const statusConfig = STATUS_CONFIG[item.status];
                const StatusIcon = statusConfig.icon;
                const linkedRec = recommendations.find((r) => r.id === item.recommendationId);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                  >
                    <Card className={`rounded-xl border shadow-sm py-0 gap-0 ${
                      item.status === 'completed' ? 'bg-emerald-50/30 border-emerald-200' : ''
                    }`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleStatus(item)}
                            className="shrink-0 mt-0.5"
                            title={`Status: ${statusConfig.label} (click to change)`}
                          >
                            <StatusIcon className={`h-4 w-4 ${
                              item.status === 'completed' ? 'text-emerald-500' :
                              item.status === 'in-progress' ? 'text-sky-500' : 'text-amber-500'
                            }`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              {item.task}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge className={`text-[9px] ${statusConfig.color}`}>
                                {statusConfig.label}
                              </Badge>
                              <span className="text-[10px] text-slate-400">
                                {item.assignee}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Due: {item.deadline}
                              </span>
                              {linkedRec && (
                                <Badge variant="outline" className="text-[9px]">
                                  {linkedRec.title}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 shrink-0"
                            onClick={() => removeActionItem(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
