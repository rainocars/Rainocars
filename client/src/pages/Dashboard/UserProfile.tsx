import React, { useRef, useState } from 'react';
import { User, FileText, Lock, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { UserDocumentType } from '@/types';
import api from '@/services/api';

const DOC_TYPES: { type: UserDocumentType; label: string }[] = [
  { type: 'DRIVING_LICENSE', label: 'Driving License' },
  { type: 'GOVERNMENT_ID', label: 'Government ID' },
  { type: 'ADDRESS_PROOF', label: 'Address Proof' },
  { type: 'OTHER', label: 'Other document' },
];

const MAX_MB = 5;

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const { updateUserProfile, addUserDocument, removeUserDocument } = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<UserDocumentType>('DRIVING_LICENSE');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Both password fields are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  const handleSaveProfile = () => {
    updateUserProfile(user.id, { name: name.trim(), phone: phone.trim() });
    refreshUser();
    toast.success('Profile updated');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_MB}MB`);
      return;
    }
    const label = DOC_TYPES.find(t => t.type === docType)?.label || 'Document';
    
    // Check if a document of this type already exists (except for OTHER)
    const existingDoc = documents.find(d => d.type === docType);
    
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      try {
        if (existingDoc && docType !== 'OTHER') {
          await removeUserDocument(user.id, existingDoc.id);
        }
        await addUserDocument(user.id, {
          type: docType,
          label,
          fileName: file.name,
          fileUrl: reader.result,
        });
        refreshUser();
        toast.success(existingDoc && docType !== 'OTHER' ? `${label} replaced` : `${label} uploaded`);
      } catch (err) {
        toast.error('Failed to upload document');
      }
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docId: string) => {
    if (!window.confirm('Remove this document?')) return;
    removeUserDocument(user.id, docId);
    refreshUser();
    toast.success('Document removed');
  };

  const documents = user.documents || [];

  return (
    <div className="max-w-4xl space-y-10">
      <div className="flex items-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent bg-accent/20 text-3xl font-bold text-accent">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-off-white">{user.name}</h1>
          <p className="text-off-white/60">Manage your account and verification documents</p>
          <Badge variant={user.isVerified ? 'success' : 'warning'} className="mt-2">
            {user.isVerified ? 'Verified' : 'Pending verification'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          <Card className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-off-white">
              <User className="h-5 w-5 text-accent" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-off-white/60">Full Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-off-white/60">Phone</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm text-off-white/60">Email</label>
                <Input value={user.email} disabled />
              </div>
            </div>
            <Button variant="primary" onClick={handleSaveProfile}>Save Changes</Button>
          </Card>

          <Card className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-off-white">
              <FileText className="h-5 w-5 text-accent" /> Documents
            </h3>
            <p className="text-sm text-off-white/50">
              Upload driving license and ID — visible to admin for verification
            </p>

            {/* Document Checklist Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {DOC_TYPES.filter(t => t.type !== 'OTHER').map(t => {
                const uploadedDoc = documents.find(d => d.type === t.type);
                return (
                  <div key={t.type} className="rounded-xl border border-accent/10 p-4 bg-primary/30 flex flex-col justify-between h-36">
                    <div>
                      <p className="text-sm font-bold text-off-white">{t.label}</p>
                      <p className="text-xs text-off-white/40 mt-1">Required for verification</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={uploadedDoc ? 'success' : 'warning'}>
                        {uploadedDoc ? 'Uploaded' : 'Missing'}
                      </Badge>
                      {uploadedDoc && (
                        <div className="flex gap-2">
                          <a
                            href={uploadedDoc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:underline"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleRemoveDoc(uploadedDoc.id)}
                            className="text-xs text-danger hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 pt-4 border-t border-accent/10">
              <label className="text-sm text-off-white/60">Select document type to upload</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value as UserDocumentType)}
                className="w-full rounded-lg border border-accent/15 bg-primary px-4 py-2 text-off-white"
              >
                {DOC_TYPES.map(t => (
                  <option key={t.type} value={t.type}>{t.label}</option>
                ))}
              </select>
            </div>

            <div
              className="cursor-pointer rounded-2xl border-2 border-dashed border-accent/20 bg-primary/50 p-8 text-center transition-colors hover:border-accent/40"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mx-auto mb-3 h-10 w-10 text-accent/60" />
              <p className="font-bold text-off-white">Upload document</p>
              <p className="text-sm text-off-white/50">PDF, JPG or PNG (max {MAX_MB}MB)</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFile}
              />
            </div>

            {documents.filter(d => d.type === 'OTHER').length > 0 && (
              <div className="space-y-3 pt-4 border-t border-accent/10">
                <p className="text-sm font-bold text-off-white">Other Uploaded Documents</p>
                {documents.filter(d => d.type === 'OTHER').map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-accent/10 p-4 bg-primary/10"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-off-white">{doc.label}</p>
                      <p className="truncate text-xs text-off-white/50">{doc.fileName}</p>
                      <p className="text-xs text-off-white/40">
                        {format(new Date(doc.uploadedAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="surface" size="sm" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveDoc(doc.id)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-off-white">
              <Lock className="h-5 w-5 text-accent" /> Security
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-off-white/60">Current Password</label>
                <Input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-off-white/60">New Password</label>
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </form>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <div className="space-y-2 text-center">
              <p className="text-xs font-bold uppercase text-off-white/40">Member since</p>
              <p className="text-xl font-bold text-off-white">
                {format(new Date(user.createdAt), 'MMMM yyyy')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
