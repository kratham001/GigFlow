import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

interface BorrowRecord {
  id: string;
  book_id: string;
  issue_date: string;
  return_date: string | null;
  status: string;
  books: {
    title: string;
    author: string;
  };
  profiles: {
    name: string;
    email: string;
  };
}

const BorrowedBooks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: records, isLoading } = useQuery({
    queryKey: ["borrow-records-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("borrow_records")
        .select(`
          *,
          books!inner (title, author)
        `)
        .order("issue_date", { ascending: false });
      if (error) throw error;
      
      const enrichedData = await Promise.all(
        data.map(async (record: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, email")
            .eq("id", record.user_id)
            .single();
          return { ...record, profiles: profile };
        })
      );
      
      return enrichedData as BorrowRecord[];
    },
  });

  const returnBookMutation = useMutation({
    mutationFn: async ({ recordId, bookId }: { recordId: string; bookId: string }) => {
      const { error: updateRecordError } = await supabase
        .from("borrow_records")
        .update({ status: "returned", return_date: new Date().toISOString() })
        .eq("id", recordId);

      if (updateRecordError) throw updateRecordError;

      const { error: updateBookError } = await supabase
        .from("books")
        .update({ available: true })
        .eq("id", bookId);

      if (updateBookError) throw updateBookError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrow-records-admin"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: "Book returned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to return book", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading records...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">All Borrowed Books</h2>
      <div className="grid gap-4">
        {records?.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <CardTitle className="text-lg">{record.books.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">by {record.books.author}</p>
              <p className="text-sm mb-1">
                <strong>Borrowed by:</strong> {record.profiles.name} ({record.profiles.email})
              </p>
              <p className="text-sm mb-1">
                <strong>Issue Date:</strong> {new Date(record.issue_date).toLocaleDateString()}
              </p>
              {record.return_date && (
                <p className="text-sm mb-1">
                  <strong>Return Date:</strong> {new Date(record.return_date).toLocaleDateString()}
                </p>
              )}
              <p className={`text-sm mb-4 ${record.status === "returned" ? "text-green-600" : "text-amber-600"}`}>
                Status: {record.status}
              </p>
              {record.status === "borrowed" && (
                <Button
                  size="sm"
                  onClick={() =>
                    returnBookMutation.mutate({
                      recordId: record.id,
                      bookId: record.book_id,
                    })
                  }
                >
                  <CheckCircle className="mr-2" size={16} />
                  Mark as Returned
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BorrowedBooks;
