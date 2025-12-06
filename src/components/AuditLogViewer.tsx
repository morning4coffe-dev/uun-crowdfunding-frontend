import { useState, useEffect } from 'react';
import { Loader2, Filter, FileText, User, DollarSign, Package } from 'lucide-react';
import client from '../api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

interface AuditLog {
  _id: string;
  entity: {
    type: 'project' | 'reward' | 'contribution' | 'user';
    id: string;
  };
  action: string;
  actorUserId: string | null;
  source: 'dashboard' | 'public_api' | 'system' | 'webhook';
  dataBefore: Record<string, unknown>;
  dataAfter: Record<string, unknown>;
  createdAt: string;
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityTypeFilter !== 'all') {
        params.append('entityType', entityTypeFilter);
      }
      if (sourceFilter !== 'all') {
        params.append('source', sourceFilter);
      }
      
      const response = await client.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [entityTypeFilter, sourceFilter]);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return Package;
      case 'user':
        return User;
      case 'contribution':
        return DollarSign;
      case 'reward':
        return FileText;
      default:
        return FileText;
    }
  };

  const getSourceBadge = (source: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      dashboard: { variant: 'default', label: 'Dashboard' },
      public_api: { variant: 'secondary', label: 'Public API' },
      system: { variant: 'outline', label: 'System' },
      webhook: { variant: 'destructive', label: 'Webhook' },
    };

    const config = variants[source] || { variant: 'outline', label: source };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.entity.type.toLowerCase().includes(query) ||
      log.entity.id.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-gray-600 mt-1">System activity and change history</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredLogs.length} entries
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Entity Type</label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="contribution">Contribution</SelectItem>
                  <SelectItem value="reward">Reward</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="public_api">Public API</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search action, entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <CardTitle className="mb-2">No audit logs found</CardTitle>
            <CardDescription>
              {searchQuery ? 'Try adjusting your search or filters' : 'No activity to display'}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const EntityIcon = getEntityIcon(log.entity.type);
            return (
              <Card key={log._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <EntityIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold">{log.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.entity.type}
                          </Badge>
                          {getSourceBadge(log.source)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Entity ID: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{log.entity.id}</code>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {log.actorUserId && (
                            <span className="ml-2">
                              by <code className="bg-gray-100 px-1 py-0.5 rounded">{log.actorUserId}</code>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
