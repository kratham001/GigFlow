import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
}

const AvailableBooks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: books, isLoading } = useQuery({
    queryKey: ["available-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("available", true)
        .order("title");
      if (error) throw error;
      return data as Book[];
    },
  });

  const borrowBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const { error: borrowError } = await supabase.from("borrow_records").insert({
        user_id: user?.id,
        book_id: bookId,
        status: "borrowed",
      });

      if (borrowError) throw borrowError;

      const { error: updateError } = await supabase
        .from("books")
        .update({ available: false })
        .eq("id", bookId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-books"] });
      queryClient.invalidateQueries({ queryKey: ["my-borrowed-books"] });
      toast({ title: "Book borrowed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to borrow book", variant: "destructive" });
    },
  });

  const filteredBooks = books?.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by title, author, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBooks?.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle className="text-lg">{book.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">by {book.author}</p>
              <p className="text-sm text-muted-foreground mb-4">Genre: {book.genre}</p>
              <Button
                className="w-full"
                onClick={() => borrowBookMutation.mutate(book.id)}
                disabled={borrowBookMutation.isPending}
              >
                {borrowBookMutation.isPending ? "Borrowing..." : "Borrow Book"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBooks?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No books found matching your search.
        </div>
      )}
    </div>
  );
};

export default AvailableBooks;
