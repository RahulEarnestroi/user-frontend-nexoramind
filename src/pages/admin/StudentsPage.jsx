import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Award, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Table, { Thead, Tbody, Th, Td, Tr } from '../../components/ui/Table';
import { users, certificates } from '../../data/mockData';
import { formatDateShort } from '../../lib/utils';

const students = users.filter(u => u.role === 'STUDENT');

export default function StudentsPage() {
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Students</h1>
        <p className="text-slate-600 mt-1">Manage registered students</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Certificates</Th>
              <Th>Joined</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map(student => {
              const certCount = certificates.filter(c => c.studentId === student.id).length;
              return (
                <Tr key={student.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary-600">{student.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </Td>
                  <Td className="text-sm">{student.email}</Td>
                  <Td>
                    <Badge variant="primary">{certCount} certificates</Badge>
                  </Td>
                  <Td className="text-sm">{formatDateShort(student.createdAt)}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}
