import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Plus, Trash2, FileText, Download, FolderOpen } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDocuments,
  useCreateDocument,
  useDeleteDocument,
} from '@/features/documents/hooks/use-documents';
import type { DocumentCategory } from '@/types/document';
import { CATEGORY_LABELS } from '@/types/document';

const categories: DocumentCategory[] = ['POLICY', 'FORM', 'CERTIFICATE', 'OFSTED', 'RISK_ASSESSMENT', 'OTHER'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const { data: documents, isLoading } = useDocuments(
    categoryFilter !== 'ALL' ? (categoryFilter as DocumentCategory) : undefined,
  );
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('POLICY');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const handleCreate = async () => {
    if (!title.trim() || !fileUrl.trim() || !fileName.trim()) {
      toast.error('Title, file URL, and file name are required');
      return;
    }
    try {
      await createDocument.mutateAsync({
        title,
        description: description || undefined,
        category,
        fileUrl,
        fileName,
        fileSize: 0,
        mimeType: 'application/pdf',
      });
      toast.success('Document uploaded');
      setDialogOpen(false);
      setTitle('');
      setDescription('');
      setFileUrl('');
      setFileName('');
    } catch {
      toast.error('Failed to upload document');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument.mutateAsync(id);
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Policies, forms, certificates, and compliance documents"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />
              Upload Document
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>File Name</Label>
                  <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="document.pdf" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createDocument.isPending}>
                  {createDocument.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? '')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : documents?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <FolderOpen className="size-10 text-muted-foreground" />
          <p className="mt-3 text-lg font-medium">No documents</p>
          <p className="mt-1 text-sm text-muted-foreground">Upload your first document to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents?.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium truncate">{doc.title}</h3>
                    {doc.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{CATEGORY_LABELS[doc.category]}</Badge>
                      {doc.fileSize > 0 && (
                        <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(parseISO(doc.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="mr-1 size-3.5" />
                      Download
                    </Button>
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
