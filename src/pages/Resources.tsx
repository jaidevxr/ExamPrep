import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResources, Resource } from '@/hooks/useResources';
import { subjects } from '@/data/subjects';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, FileText, Upload, Download, Search, Filter, Loader2,
  BookOpen, ScrollText, Trash2, Eye, X
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Resources() {
  const navigate = useNavigate();
  const { resources, loading, uploading, isAdmin, loadResources, uploadResource, deleteResource } = useResources();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadType, setUploadType] = useState<'pyq' | 'notes'>('pyq');
  const [uploadYear, setUploadYear] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleFilterChange = (subject: string, type: string) => {
    setSubjectFilter(subject);
    setTypeFilter(type);
    loadResources(subject, type);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle || !uploadSubject) {
      toast.error('Please fill all required fields');
      return;
    }
    const success = await uploadResource(uploadFile, uploadTitle, uploadSubject, uploadType, uploadYear, uploadDesc);
    if (success) {
      setUploadOpen(false);
      setUploadTitle('');
      setUploadSubject('');
      setUploadYear('');
      setUploadDesc('');
      setUploadFile(null);
    }
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || id;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4">
        <div className="max-w-4xl mx-auto py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-black arcade-text text-primary">RESOURCES</h1>
          {isAdmin && (
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button className="ml-auto font-black arcade-text text-xs">
                  <Upload className="h-4 w-4 mr-1" /> Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="minecraft-block max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-black arcade-text text-primary">Upload Resource</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Title *</Label>
                    <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. IoT Mid-Term 2024" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Subject *</Label>
                    <Select value={uploadSubject} onValueChange={setUploadSubject}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Type *</Label>
                    <Select value={uploadType} onValueChange={(v) => setUploadType(v as 'pyq' | 'notes')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pyq">Previous Year Question</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Year (optional)</Label>
                    <Input value={uploadYear} onChange={(e) => setUploadYear(e.target.value)} placeholder="e.g. 2024" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Description (optional)</Label>
                    <Input value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder="Brief description..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">File * (PDF, JPG, PNG — max 10MB)</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                      {uploadFile ? uploadFile.name : 'Choose file...'}
                    </Button>
                  </div>
                  <Button onClick={handleUpload} disabled={uploading} className="w-full font-black arcade-text">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'UPLOAD'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Select value={subjectFilter} onValueChange={(v) => handleFilterChange(v, typeFilter)}>
            <SelectTrigger className="w-full sm:w-40 h-10">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => handleFilterChange(subjectFilter, v)}>
            <SelectTrigger className="w-full sm:w-32 h-10">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pyq">PYQs</SelectItem>
              <SelectItem value="notes">Notes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resource List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 minecraft-block text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="font-black arcade-text text-muted-foreground text-sm">No Resources Found</p>
            <p className="text-xs text-muted-foreground mt-2">
              {isAdmin ? 'Upload PYQs and Notes using the button above' : 'Check back later for study materials'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((r) => (
              <Card key={r.id} className="p-4 minecraft-block hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${r.type === 'pyq' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                    {r.type === 'pyq' ? (
                      <ScrollText className="h-5 w-5 text-orange-500" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">{r.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {getSubjectName(r.subject_id)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.type === 'pyq' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {r.type.toUpperCase()}
                      </span>
                      {r.year && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {r.year}
                        </span>
                      )}
                    </div>
                    {r.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.open(r.file_url, '_blank')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                      <a href={r.file_url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="minecraft-block">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{r.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteResource(r.id)} className="bg-destructive">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
