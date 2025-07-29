import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJournalIssueSchema } from "@shared/schema";
import type { JournalIssue, InsertJournalIssue } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { toRomanNumeral } from "@/lib/journal-utils";
import { apiRequest } from "@/lib/queryClient";

export default function JournalAdminPage() {
  const [editingIssue, setEditingIssue] = useState<JournalIssue | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: issues, isLoading } = useQuery<JournalIssue[]>({
    queryKey: ["/api/journal"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertJournalIssue) => apiRequest("/api/journal", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Success",
        description: "Journal issue created successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create journal issue",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertJournalIssue> }) =>
      apiRequest(`/api/journal/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Success",
        description: "Journal issue updated successfully",
      });
      setEditingIssue(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update journal issue",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/journal/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Success",
        description: "Journal issue deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete journal issue",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertJournalIssue>({
    resolver: zodResolver(insertJournalIssueSchema),
    defaultValues: {
      title: "",
      body: "",
      volume: 1,
      issue: 1,
      year: new Date().getFullYear(),
      tags: [],
    },
  });

  const handleSubmit = (data: InsertJournalIssue) => {
    if (editingIssue) {
      updateMutation.mutate({ id: editingIssue.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (issue: JournalIssue) => {
    setEditingIssue(issue);
    form.reset({
      title: issue.title,
      body: issue.body,
      volume: issue.volume,
      issue: issue.issue,
      year: issue.year,
      tags: issue.tags || [],
    });
  };

  const handleCancelEdit = () => {
    setEditingIssue(null);
    form.reset({
      title: "",
      body: "",
      volume: 1,
      issue: 1,
      year: new Date().getFullYear(),
      tags: [],
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this journal issue?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Zhi Systems
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/journal" className="text-blue-600 hover:text-blue-800">
              Journal
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Admin</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Journal Administration
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {editingIssue ? "Edit Issue" : "Create New Issue"}
            </h2>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Article Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter article title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="volume">Volume</Label>
                  <Input
                    id="volume"
                    type="number"
                    min="1"
                    {...form.register("volume", { valueAsNumber: true })}
                  />
                  {form.formState.errors.volume && (
                    <p className="text-sm text-red-600">{form.formState.errors.volume.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="issue">Issue</Label>
                  <Input
                    id="issue"
                    type="number"
                    min="1"
                    {...form.register("issue", { valueAsNumber: true })}
                  />
                  {form.formState.errors.issue && (
                    <p className="text-sm text-red-600">{form.formState.errors.issue.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2000"
                    max="2100"
                    {...form.register("year", { valueAsNumber: true })}
                  />
                  {form.formState.errors.year && (
                    <p className="text-sm text-red-600">{form.formState.errors.year.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="body">Article Body</Label>
                <Textarea
                  id="body"
                  rows={12}
                  {...form.register("body")}
                  placeholder="Enter article content (markdown supported)"
                  className="font-mono"
                />
                {form.formState.errors.body && (
                  <p className="text-sm text-red-600">{form.formState.errors.body.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingIssue ? "Update Issue" : "Create Issue"}
                </Button>
                
                {editingIssue && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Issues List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Existing Issues</h2>

            {isLoading ? (
              <div className="text-center py-8">Loading issues...</div>
            ) : !issues || issues.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No issues created yet.</div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                        <p className="text-sm text-gray-600">
                          Vol. {toRomanNumeral(issue.volume)}, No. {issue.issue} ({issue.year})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(issue)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(issue.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {issue.body.substring(0, 150)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}