import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BorrowRecord {
  id: string;
  issue_date: string;
  return_date: string | null;
  status: string;
  books: {
    title: string;
    author: string;
    genre: string;
  };
}

const MyBorrowedBooks = () => {
  const { user } = useAuth();

  const { data: records, isLoading } = useQuery({
    queryKey: ["my-borrowed-books", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("borrow_records")
        .select(`
          *,
          books (title, author, genre)
        `)
        .eq("user_id", user?.id)
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return data as BorrowRecord[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading your books...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Borrowed Books</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {records?.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <CardTitle className="text-lg">{record.books.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">by {record.books.author}</p>
              <p className="text-sm text-muted-foreground mb-2">Genre: {record.books.genre}</p>
              <p className="text-sm mb-1">
                <strong>Borrowed:</strong> {new Date(record.issue_date).toLocaleDateString()}
              </p>
              {record.return_date && (
                <p className="text-sm mb-1">
                  <strong>Returned:</strong> {new Date(record.return_date).toLocaleDateString()}
                </p>
              )}
              <p className={`text-sm ${record.status === "returned" ? "text-green-600" : "text-amber-600"}`}>
                Status: {record.status}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {records?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          You haven't borrowed any books yet.
        </div>
      )}
    </div>
  );
};

export default MyBorrowedBooks;
