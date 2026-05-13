'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AVATAR_OPTIONS } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StudentData {
  id: string;
  nickname: string;
  avatar: string;
  missionsCompleted: number;
  totalScore: number;
  lastActive: string;
}

interface StudentProgressProps {
  students: StudentData[];
}

export default function StudentProgress({ students }: StudentProgressProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedId);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-800">Student Progress</h3>

      {students.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No students have joined yet.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Missions</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Active</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((student) => {
                    const avatarEmoji =
                      AVATAR_OPTIONS.find((a) => a.id === student.avatar)?.emoji ?? '👤';
                    const isSelected = selectedId === student.id;

                    return (
                      <TableRow
                        key={student.id}
                        className="cursor-pointer hover:bg-amber-50/50"
                        onClick={() => setSelectedId(isSelected ? null : student.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{avatarEmoji}</span>
                            <span className="font-medium text-sm">{student.nickname}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {student.missionsCompleted}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-amber-600">
                          {student.totalScore}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-slate-500">
                          {formatDate(student.lastActive)}
                        </TableCell>
                        <TableCell>
                          <ChevronRight
                            className={`h-4 w-4 text-slate-400 transition-transform ${
                              isSelected ? 'rotate-90' : ''
                            }`}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail view */}
      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm text-slate-700 mb-2">
                {AVATAR_OPTIONS.find((a) => a.id === selectedStudent.avatar)?.emoji ?? '👤'}{' '}
                {selectedStudent.nickname} — Details
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {selectedStudent.missionsCompleted}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">Missions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {selectedStudent.totalScore}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">Total Score</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedStudent.missionsCompleted > 0
                      ? Math.round(selectedStudent.totalScore / selectedStudent.missionsCompleted)
                      : 0}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
