import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Download, Eye, Ban, Copy, Filter, Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table, { Thead, Tbody, Th, Td, Tr } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { certificates } from '../../data/mockData';
import { formatDateShort, getStatusColor, getVerificationUrl, copyToClipboard } from '../../lib/utils';

const filters = ['All', 'ACTIVE', 'REVOKED', 'EXPIRED'];

export default function AdminCertificatesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [viewCert, setViewCert] = useState(null);

  const filtered = certificates.filter(c => {
    const matchFilter = activeFilter === 'All' || c.status === activeFilter;
    const matchSearch = !search ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.certificateId.toLowerCase().includes(search.toLowerCase()) ||
      c.studentEmail.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleCopy = async (id) => {
    await copyToClipboard(getVerificationUrl(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certificates</h1>
          <p className="text-slate-600 mt-1">Manage all issued certificates</p>
        </div>
        <Link to="/admin/certificates/issue">
          <Button><Plus className="w-4 h-4" /> Issue Certificate</Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Certificate ID</Th>
              <Th>Student</Th>
              <Th>Certification</Th>
              <Th>Issue Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map(cert => (
              <Tr key={cert.id}>
                <Td>
                  <span className="font-mono text-sm">{cert.certificateId}</span>
                </Td>
                <Td>
                  <div>
                    <p className="font-medium">{cert.studentName}</p>
                    <p className="text-xs text-slate-500">{cert.studentEmail}</p>
                  </div>
                </Td>
                <Td className="text-sm">{cert.certificationName}</Td>
                <Td className="text-sm">{formatDateShort(cert.issueDate)}</Td>
                <Td>
                  <Badge variant={cert.status === 'ACTIVE' ? 'success' : cert.status === 'REVOKED' ? 'danger' : 'warning'}>
                    {cert.status}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewCert(cert)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleCopy(cert.certificateId)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Copy link">
                      <Copy className="w-4 h-4" />
                    </button>
                    {cert.status === 'ACTIVE' && (
                      <button className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-500" title="Revoke">
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500">No certificates found.</div>
        )}
      </Card>

      {/* View Modal */}
      <Modal open={!!viewCert} onClose={() => setViewCert(null)} title="Certificate Details">
        {viewCert && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-xl text-center">
              <p className="text-xs text-slate-500">Certificate ID</p>
              <p className="text-xl font-bold font-mono text-primary-700">{viewCert.certificateId}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500">Student</p><p className="font-medium">{viewCert.studentName}</p></div>
              <div><p className="text-slate-500">Email</p><p className="font-medium">{viewCert.studentEmail}</p></div>
              <div><p className="text-slate-500">Certification</p><p className="font-medium">{viewCert.certificationName}</p></div>
              <div><p className="text-slate-500">Score</p><p className="font-medium">{viewCert.score}%</p></div>
              <div><p className="text-slate-500">Issue Date</p><p className="font-medium">{formatDateShort(viewCert.issueDate)}</p></div>
              <div><p className="text-slate-500">Status</p><Badge variant={viewCert.status === 'ACTIVE' ? 'success' : 'danger'}>{viewCert.status}</Badge></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleCopy(viewCert.certificateId)} variant="secondary" className="flex-1">
                <Copy className="w-4 h-4" /> Copy Link
              </Button>
              <Link to={`/verify/${viewCert.certificateId}`} target="_blank" className="flex-1">
                <Button variant="secondary" className="w-full"><Eye className="w-4 h-4" /> Verify</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
