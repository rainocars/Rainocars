import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, ExternalLink, User } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useData } from '@/context/DataContext';

const typeLabel: Record<string, string> = {
  DRIVING_LICENSE: 'Driving License',
  GOVERNMENT_ID: 'Government ID',
  ADDRESS_PROOF: 'Address Proof',
  OTHER: 'Other',
};

const AdminDocuments = () => {
  const { getAllUserDocuments } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadDocs = async () => {
      try {
        const data = await getAllUserDocuments();
        setDocs(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, [getAllUserDocuments]);

  const filtered = docs.filter(d => {
    const q = search.toLowerCase();
    const matchSearch =
      d.userName.toLowerCase().includes(q) ||
      d.userEmail.toLowerCase().includes(q) ||
      d.fileName.toLowerCase().includes(q) ||
      d.label.toLowerCase().includes(q);
    const matchType = filter === 'ALL' || d.type === filter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-off-white">User Documents</h1>
        <p className="text-off-white/60">All driving licenses and uploads from customers</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-off-white/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search user, email, or file..."
            className="w-full rounded-xl border border-accent/15 bg-surface-elevated py-3 pl-12 pr-4 text-off-white outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="rounded-xl border border-accent/15 bg-surface-elevated px-4 py-3 text-off-white"
        >
          <option value="ALL">All types</option>
          <option value="DRIVING_LICENSE">Driving License</option>
          <option value="GOVERNMENT_ID">Government ID</option>
          <option value="ADDRESS_PROOF">Address Proof</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="py-16 text-center text-off-white/50">
          <FileText className="mx-auto mb-4 h-12 w-12 opacity-40" />
          No documents uploaded yet
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(doc => (
            <Card key={doc.id} className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="accent">{typeLabel[doc.type] || doc.type}</Badge>
                  <p className="mt-2 font-bold text-off-white">{doc.label}</p>
                  <p className="text-xs text-off-white/50">{doc.fileName}</p>
                </div>
                <p className="text-xs text-off-white/40">
                  {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-off-white/70">
                <User className="h-4 w-4 text-accent" />
                <div>
                  <p className="font-medium text-off-white">{doc.userName}</p>
                  <p className="text-xs">{doc.userEmail}</p>
                </div>
              </div>
              {doc.fileUrl.startsWith('data:image') ? (
                <img src={doc.fileUrl} alt={doc.label} className="h-40 w-full rounded-lg border border-accent/10 object-cover" />
              ) : (
                <div className="flex h-24 items-center justify-center rounded-lg bg-primary text-off-white/40">
                  <FileText className="h-8 w-8" />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="surface" size="sm" className="flex-1" asChild>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="h-4 w-4" /> View
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/users">User profile</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
